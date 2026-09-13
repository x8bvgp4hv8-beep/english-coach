"""
Второй шаг озвучки фраз: спрайты и таймкоды.

Почему спрайты, а не файл на фразу: фраз тридцать семь тысяч, и файлами это семьдесят
четыре тысячи штук на два голоса — больше, чем принимает хостинг статики, и неподъёмно
для git. Глава склеивается в один opus, а рядом кладётся манифест с таймкодами; переход
внутрь файла по времени проверен и точен до миллисекунды.

Запуск (через npm run build:voice:phrases — он сначала выгружает фразы):

    uv run --with piper-tts python scripts/voice-build.py --language en --gender female

Модели берутся из `.voice-models` (их же качает build-voice.mjs). Результат:

    public/voice/<язык>/<пол>/<глава>.opus          — спрайт главы
    public/voice/<язык>/<пол>/phrases-<уровень>.json — хэш фразы → [глава, старт, длина]

Битрейт 16 кбит/с: на речи opus в этом режиме остаётся разборчивым, а тысяча минут
укладывается в сто с небольшим мегабайт вместо ста шестидесяти при 24 кбит/с.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / '.voice-models'
BITRATE = '16k'
GAP_MS = 260

# Голоса Piper: по одному на язык и пол. Мужского испанского с женским из одного набора
# нет, поэтому испанский собран из разных — на слух это два разных диктора, что и нужно.
VOICES = {
    ('en', 'female'): 'en_US-lessac-medium',
    ('en', 'male'): 'en_US-ryan-medium',
    ('es', 'female'): 'es_MX-claude-high',
    ('es', 'male'): 'es_ES-davefx-medium',
}


def djb2(text: str) -> str:
    """Хэш фразы. Тот же алгоритм в `speech.ts`: синхронный, без крипто-API."""
    value = 5381
    for char in text:
        value = ((value * 33) ^ ord(char)) & 0xFFFFFFFF
    return format(value, '08x')


def model_path(name: str) -> Path:
    path = MODELS / f'{name}.onnx'
    if not path.exists():
        raise SystemExit(f'нет модели {path}. Скачай: npm run build:voice (он их кладёт в .voice-models)')
    return path


def build(language: str, gender: str, only_level: str | None) -> None:
    from piper import PiperVoice

    plan = json.loads((ROOT / '.voice-build' / 'phrases.json').read_text(encoding='utf-8'))
    plan = [item for item in plan if item['language'] == language]
    if only_level:
        plan = [item for item in plan if item['level'] == only_level]
    if not plan:
        raise SystemExit(f'нет глав для {language} {only_level or ""}')

    voice_name = VOICES[(language, gender)]
    print(f'{language}/{gender}: модель {voice_name}, глав {len(plan)}, '
          f'фраз {sum(len(i["phrases"]) for i in plan)}')
    voice = PiperVoice.load(str(model_path(voice_name)))

    out_dir = ROOT / 'public' / 'voice' / language / gender
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = ROOT / '.voice-build' / 'wav'
    tmp_dir.mkdir(parents=True, exist_ok=True)

    manifests: dict[str, dict[str, list]] = {}
    started = time.time()
    total_bytes = 0

    for index, item in enumerate(plan, 1):
        chapter = item['chapter']
        wav_path = tmp_dir / f'{chapter}.wav'
        opus_path = out_dir / f'{chapter}.opus'
        marks: dict[str, list] = {}

        pcm = bytearray()
        rate = None
        for text in item['phrases']:
            start = len(pcm)
            for chunk in voice.synthesize(text):
                rate = rate or chunk.sample_rate
                pcm.extend(chunk.audio_int16_bytes)
            per_second = (rate or 22050) * 2
            marks[djb2(text)] = [
                chapter,
                round(start / per_second, 3),
                round((len(pcm) - start) / per_second, 3),
            ]
            pcm.extend(b'\x00' * int(per_second * GAP_MS / 1000))

        with wave.open(str(wav_path), 'wb') as handle:
            handle.setnchannels(1)
            handle.setsampwidth(2)
            handle.setframerate(rate or 22050)
            handle.writeframes(bytes(pcm))

        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav_path),
             '-c:a', 'libopus', '-b:a', BITRATE, '-ac', '1', '-application', 'voip', str(opus_path)],
            check=True,
        )
        wav_path.unlink(missing_ok=True)
        total_bytes += opus_path.stat().st_size
        manifests.setdefault(item['level'], {}).update(marks)

        if index % 10 == 0 or index == len(plan):
            done = time.time() - started
            print(f'  {index}/{len(plan)} глав, {total_bytes / 1024 / 1024:.1f} МБ, '
                  f'{done / 60:.1f} мин, осталось ~{(done / index) * (len(plan) - index) / 60:.0f} мин',
                  flush=True)

    for level, marks in manifests.items():
        path = out_dir / f'phrases-{level.lower()}.json'
        # Манифест дописывается, а не перезаписывается: уровень можно собирать частями.
        existing = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
        existing.update(marks)
        path.write_text(json.dumps(existing, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        print(f'  манифест {path.name}: фраз {len(existing)}')

    print(f'{language}/{gender}: готово, {total_bytes / 1024 / 1024:.1f} МБ '
          f'за {(time.time() - started) / 60:.1f} мин')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--language', required=True, choices=['en', 'es'])
    parser.add_argument('--gender', required=True, choices=['female', 'male'])
    parser.add_argument('--level', help='только один уровень, например B1')
    args = parser.parse_args()
    build(args.language, args.gender, args.level)
