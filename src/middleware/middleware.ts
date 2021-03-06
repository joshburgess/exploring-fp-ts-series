import { Either, fromPredicate, left, right } from 'fp-ts/lib/Either'
import { fromEither, TaskEither, right as taskEitherRight } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'

export type TMiddleware<Env, Context> =
  (env: Env, next: (context: Context) => Context) =>
    (context: Context) => Context


export const buildMiddleware =
  <Env, Context>(...middlewares: Array<TMiddleware<Env, Context>>) =>
    (env: Env) =>
      (req: Context): Context => {
        const runFinal = (context: any) => context
        const chain = middlewares
          .reduceRight(
            (next: any, middleware) => middleware(env, next),
            runFinal
          )
        return chain(req)
      }


// Either pipeline

// const a: TMiddleware<any, Either<IResponse, IRequest>> = (env, next) => ctx => {
//   console.log('a', ctx)
//   return next(ctx.map(x => ({ ...x, res: 1 })))
// }
// const b: TMiddleware<any, Either<IResponse, IRequest>> = (env, next) => ctx => {
//   console.log('b', ctx)
//   return next(ctx.chain(() =>
//     left({
//       error: new Error('boom')
//     })
//   ))
// }
//
// const c: TMiddleware<any, Either<IResponse, IRequest>> = (env, next) => ctx => {
//   console.log('c', ctx)
//   return next(ctx.chain(() =>
//     left({
//       data: 20
//     })
//   ))
// }
//
// const eitherHandler = (ctx: Either<IResponse, IRequest>): IResponse => {
//   console.log('either handler', ctx)
//   return ctx.fold((res) => res, (req) => ({ error: new Error('No request was made') }))
// }
//
// console.log('Either', buildMiddleware(a, b, c)({}, eitherHandler)(right({ data: 0 })))
//
// // TaskEither
//
// const teA: TMiddleware<any, TaskEither<IResponse, IRequest>> = (env, next) => ctx => {
//   console.log('a', ctx)
//   return next(ctx.map(x => ({ ...x, res: 1 })))
// }
// const teFail: TMiddleware<any, TaskEither<IResponse, IRequest>> = (env, next) => ctx => {
//   console.log('b', ctx)
//   return next(ctx.chain(() =>
//     fromEither(left({
//       error: new Error('boom')
//     }))
//   ))
// }
//
// const teSucceed: TMiddleware<any, TaskEither<IResponse, IRequest>> = (env, next) => ctx => {
//   console.log('c', ctx)
//   return next(ctx.chain(() =>
//     fromEither(left({
//       data: 20
//     }))
//   ))
// }
//
// const taskEitherHandler: THandler<TaskEither<IResponse, IRequest>, TaskEither<IResponse, IResponse>> = (ctx) => {
//   console.log('task either handler', ctx)
//   const task: Task<IResponse> = ctx
//     .fold(
//       (res) => res,
//       (req) => ({ error: new Error('No request was made') })
//     )
//   return taskEitherRight<IResponse, IResponse>(task)
//     .chain((res) => {
//       if (res.error) {
//         return fromEither(left(res))
//       } else {
//         return fromEither(right(res))
//       }
//     })
// }
//
// const taskEitherPipeline =
//   buildMiddleware(teA, teSucceed, teFail)({}, taskEitherHandler)
//
// taskEitherPipeline(fromEither(right({ data: 0 })))
//   .fold(
//     (err) => {
//       console.log('TaskEither error', err)
//     },
//     (res: any) => {
//       console.log('TaskEither', res)
//     }
//   )
//   .run()
//
