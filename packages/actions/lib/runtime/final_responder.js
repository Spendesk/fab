'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const core_1 = require('@fab/core')
const FinalResponder = ({ Router }) => {
  Router.onAll(async ({ url }) => {
    // We're the last middleware to be called, and so we:
    //   a) always respond
    //   b) return a status 444 No Response
    //
    // We assume that this 444 will be picked up by a previous middleware's
    // interceptResponse directive, and turned into a meaningful 404.
    return new Response(`No resource found at ${url.pathname}\n`, {
      status: core_1.NO_RESPONSE_STATUS_CODE,
      statusText: 'No Response',
      headers: {},
    })
  }, core_1.Priority.LAST)
}
exports.default = FinalResponder
//# sourceMappingURL=final_responder.js.map
