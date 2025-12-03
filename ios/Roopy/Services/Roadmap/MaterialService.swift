import Foundation

/// 教材データを管理するサービス
final class MaterialService {

    static let shared = MaterialService()

    private init() {}

    /// 全教材を取得
    func fetchAllMaterials() async throws -> [EnglishMaterial] {
        try await supabase
            .from("mukimuki_english_materials")
            .select()
            .eq("is_published", value: true)
            .order("stage_id")
            .order("display_order")
            .execute()
            .value
    }

    /// ステージ別教材を取得
    func fetchMaterials(stageId: String) async throws -> [EnglishMaterial] {
        try await supabase
            .from("mukimuki_english_materials")
            .select()
            .eq("stage_id", value: stageId)
            .eq("is_published", value: true)
            .order("display_order")
            .execute()
            .value
    }

    /// カテゴリ別教材を取得
    func fetchMaterials(category: String) async throws -> [EnglishMaterial] {
        try await supabase
            .from("mukimuki_english_materials")
            .select()
            .eq("material_category", value: category)
            .eq("is_published", value: true)
            .order("stage_id")
            .execute()
            .value
    }

    /// 複数ステージの教材を取得
    func fetchMaterials(stageIds: [String]) async throws -> [EnglishMaterial] {
        try await supabase
            .from("mukimuki_english_materials")
            .select()
            .in("stage_id", values: stageIds)
            .eq("is_published", value: true)
            .order("stage_id")
            .order("display_order")
            .execute()
            .value
    }

    /// 教材IDで取得
    func fetchMaterial(id: Int) async throws -> EnglishMaterial? {
        let materials: [EnglishMaterial] = try await supabase
            .from("mukimuki_english_materials")
            .select()
            .eq("id", value: id)
            .limit(1)
            .execute()
            .value

        return materials.first
    }
}
