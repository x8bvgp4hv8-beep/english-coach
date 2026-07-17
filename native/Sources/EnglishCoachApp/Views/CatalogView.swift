import SwiftUI
import EnglishCoachCore

struct CatalogView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        VStack(spacing: 0) {
            HStack { Button { model.screen = .map } label: { Label("Маршрут", systemImage: "chevron.left") }; Spacer(); Text("Каталог").font(.title2.bold()); Spacer() }.padding(20)
            List {
                ForEach(model.courses) { course in
                    Section(course.level.rawValue) {
                        ForEach(course.chapters.flatMap(\.lessons)) { lesson in
                            Button { model.startLesson(lesson) } label: {
                                HStack { VStack(alignment: .leading) { Text(lesson.title).font(.headline); Text(lesson.summary).font(.caption).foregroundStyle(.secondary) }; Spacer(); Text("\(lesson.estimatedMinutes) мин"); Image(systemName: "chevron.right") }
                            }.buttonStyle(.plain).padding(.vertical, 6)
                        }
                    }
                }
            }.scrollContentBackground(.hidden)
        }
    }
}
