// dumpAnalyse.js
const DumpAnalyseTool = {

    countLines(code) {
        if (!code || typeof code !== 'string') return 0;
        return code.split('\n').length;
    },


    countWords(code) {
        if (!code || typeof code !== 'string') return 0;
        const words = code.match(/\b\w+\b/g); // 匹配单词
        return words ? words.length : 0;
    },


    countCharacters(code) {
        if (!code || typeof code !== 'string') return 0;
        return code.length;
    },


    findKeywords(code, keywords) {
        if (!code || typeof code !== 'string' || !keywords || !Array.isArray(keywords)) {
            return {};
        }

        const keywordCount = {};
        keywords.forEach((keyword) => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g'); // 匹配完整单词
            const matches = code.match(regex);
            keywordCount[keyword] = matches ? matches.length : 0;
        });

        return keywordCount;
    },


    extractComments(code) {
        if (!code || typeof code !== 'string') return [];
        const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\//g; // 匹配单行注释和多行注释
        return code.match(commentRegex) || [];
    },


    calculateComplexity(code) {
        if (!code || typeof code !== 'string') return 0;

        // 计算嵌套深度（基于花括号）
        const depth = (code.match(/{/g) || []).length;

        // 计算复杂度分数
        const lines = this.countLines(code);
        return lines * depth;
    },

    formatCode(code) {
        if (!code || typeof code !== 'string') return '';
        return code
            .replace(/\s+/g, ' ') // 将多个空格替换为一个空格
            .replace(/\s*{\s*/g, ' { ') // 格式化花括号
            .replace(/\s*}\s*/g, ' } ')
            .trim();
    },
};

export default DumpAnalyseTool;