import { publicProcedure, router } from "../index";
import { articleRouter } from "./article";
import { explanationRouter } from "./explanation";
import { ttsRouter } from "./tts";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  article: articleRouter,
  explanation: explanationRouter,
  tts: ttsRouter,
});
export type AppRouter = typeof appRouter;
