module.exports = {
    _before: function () { // 通用预处理器
    },
    /**
     * 获取推荐菜谱
     * @param {string} goal 用户健康目标 (e.g. 'low_sugar')
     */
    async getRecommendedRecipes(goal) {
        const db = uniCloud.database()
        const collection = db.collection('recipes')

        let whereClause = {}
        if (goal) {
            // 简单映射：low_sugar -> health_tags contains 'low_sugar'
            whereClause.health_tags = goal
        }

        const res = await collection
            .where(whereClause)
            .limit(6)
            .get()

        return {
            code: 0,
            msg: 'success',
            data: res.data
        }
    },

    /**
     * 搜索菜谱
     * @param {string} keyword 关键词
     */
    async searchRecipes(keyword) {
        const db = uniCloud.database()
        const collection = db.collection('recipes')

        let whereClause = {}
        if (keyword) {
            whereClause = db.command.or([
                { title: new RegExp(keyword, 'i') },
                { content: new RegExp(keyword, 'i') }
            ])
        }

        const res = await collection
            .where(whereClause)
            .limit(20)
            .get()

        return {
            code: 0,
            msg: 'success',
            data: res.data
        }
    }
}
