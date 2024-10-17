export {};

declare global {
  interface Window {
    printPerf: () => void;
    __LOWCODER_ORG__?: {};
    LOWCODER_DEFAULT_QUERY_TIMEOUT: number,
    dayjs: {};
    supabase: any;
    numbro: any;
    Papa: any;
    uuid: any;
  }
}
