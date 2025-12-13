import { VideoExtractor, IVideo, ISource } from '../models';
export interface IMegaCloudOutput {
    headers: Record<string, string>;
    sources: Source[];
    tracks?: Track[];
    encrypted?: boolean;
    intro?: Timeskip;
    outro?: Timeskip;
    server?: number;
}
export interface Timeskip {
    start?: number;
    end?: number;
}
export interface Source {
    file?: string;
    type?: string;
}
export interface Track {
    file?: string;
    label?: string;
    kind?: string;
    default?: boolean;
}
declare class MegaCloud extends VideoExtractor {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL, referer: string) => Promise<ISource>;
}
export default MegaCloud;
