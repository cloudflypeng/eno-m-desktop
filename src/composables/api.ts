// import type API from '~/background/msg.define'
// import { apiProxy } from '~/background/api/index'

// type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
//   ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
//   : Lowercase<S>

// type APIFunction<T = typeof API> = {
//   [K in keyof T as CamelCase<string & K>]: {
//     [P in keyof T[K]as CamelCase<string & P>]: (options?: object) => Promise<any>
//   }
// }

// // eslint-disable-next-line ts/no-unsafe-declaration-merging
// export interface APIClient extends APIFunction {
//   biliMusic: {
//     getMusicRank: (params: { list_id: number }) => Promise<any>
//     getMusicRankList: () => Promise<any>
//   }

// }

// // eslint-disable-next-line ts/no-unsafe-declaration-merging
// export class APIClient {
//   private readonly cache = new Map<string | symbol, any>()

//   constructor() {
//     // @ts-expect-error ignore
//     return new Proxy({}, {
//       get: (_, namespace) => { // namespace
//         if (this.cache.has(namespace)) {
//           return this.cache.get(namespace)
//         }
//         else {
//           const api = new Proxy({}, {
//             get(_, p) {
//               return (options?: object) => {
//                 return apiProxy({
//                   contentScriptQuery: p.toString(),
//                   ...options,
//                 })
//               }
//             },
//           })
//           this.cache.set(namespace, api)
//           return api
//         }
//       },
//     })
//   }
// }

const api: {
	[key: string]: any;
} = {};

export function useApiClient() {
	return api;
}
