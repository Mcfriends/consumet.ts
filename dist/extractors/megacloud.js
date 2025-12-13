"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const cheerio_1 = require("cheerio");
class MegaCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'MegaCloud';
        this.sources = [];
        this.extract = async (videoUrl, referer) => {
            var _a, _b, _c, _d;
            try {
                const { data: embedData } = await this.client.get(videoUrl.href, {
                    headers: {
                        Referer: referer,
                    },
                });
                const $ = (0, cheerio_1.load)(embedData);
                const dataId = $('div[data-id]').attr('data-id');
                let nonce = null;
                // Try a single 48-char token first
                const regex48 = /\b[a-zA-Z0-9]{48}\b/;
                const match48 = embedData.match(regex48);
                if (match48 && match48[0]) {
                    nonce = match48[0];
                }
                else {
                    // Fallback: concatenate multiple 16-char tokens
                    const regex16 = /"([a-zA-Z0-9]{16})"/g;
                    const parts = [];
                    let m;
                    while ((m = regex16.exec(embedData)) !== null) {
                        if (m[1])
                            parts.push(m[1]);
                    }
                    if (parts.length)
                        nonce = parts.join('');
                }
                if (nonce) {
                    const { data } = await this.client.get(`https://megacloud.blog/embed-2/v3/e-1/getSources`, {
                        params: {
                            id: dataId,
                            _k: nonce,
                        },
                        headers: {
                            Referer: videoUrl.href,
                        },
                    });
                    if (!data.sources || data.sources.length === 0) {
                        throw new Error('No sources returned');
                    }
                    data.sources.forEach(src => {
                        var _a, _b, _c, _d, _e;
                        return this.sources.push({
                            url: src.file || '',
                            quality: (_a = src.type) !== null && _a !== void 0 ? _a : 'auto',
                            isM3U8: (_c = (_b = src.file) === null || _b === void 0 ? void 0 : _b.includes('.m3u8')) !== null && _c !== void 0 ? _c : false,
                            isDASH: (_e = (_d = src.file) === null || _d === void 0 ? void 0 : _d.includes('.mpd')) !== null && _e !== void 0 ? _e : false,
                        });
                    });
                    const subtitles = (_b = (_a = data.tracks) === null || _a === void 0 ? void 0 : _a.filter(x => x.kind === 'captions').map(t => {
                        var _a;
                        return ({
                            lang: (_a = t.label) !== null && _a !== void 0 ? _a : 'Unknown',
                            url: t.file || '',
                        });
                    })) !== null && _b !== void 0 ? _b : [];
                    const thumbnails = (_d = (_c = data.tracks) === null || _c === void 0 ? void 0 : _c.filter(x => x.kind === 'thumbnails').map(t => ({
                        url: t.file || '',
                    }))) !== null && _d !== void 0 ? _d : [];
                    const result = {
                        sources: this.sources,
                        subtitles,
                        thumbnails,
                        intro: data.intro
                            ? {
                                start: data.intro.start,
                                end: data.intro.end,
                            }
                            : { start: 0, end: 0 },
                        outro: data.outro
                            ? {
                                start: data.outro.start,
                                end: data.outro.end,
                            }
                            : { start: 0, end: 0 },
                        headers: {
                            ...data.headers,
                            Referer: videoUrl.href,
                        },
                        embedURL: videoUrl.href,
                    };
                    return result;
                }
                return { sources: [], subtitles: [] };
            }
            catch (err) {
                throw new Error(`Failed to extract video sources for ${videoUrl.href}: ${err.message}`);
            }
        };
    }
}
exports.default = MegaCloud;
//# sourceMappingURL=megacloud.js.map