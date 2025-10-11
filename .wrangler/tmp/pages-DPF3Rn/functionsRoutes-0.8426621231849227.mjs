import { onRequestGet as __api_send_email_js_onRequestGet } from "C:\\Users\\resol\\FIT5032_Project\\FIT5032_Assignment1\\functions\\api\\send-email.js"
import { onRequestOptions as __api_send_email_js_onRequestOptions } from "C:\\Users\\resol\\FIT5032_Project\\FIT5032_Assignment1\\functions\\api\\send-email.js"
import { onRequestPost as __api_send_email_js_onRequestPost } from "C:\\Users\\resol\\FIT5032_Project\\FIT5032_Assignment1\\functions\\api\\send-email.js"

export const routes = [
    {
      routePath: "/api/send-email",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_send_email_js_onRequestGet],
    },
  {
      routePath: "/api/send-email",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_send_email_js_onRequestOptions],
    },
  {
      routePath: "/api/send-email",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_send_email_js_onRequestPost],
    },
  ]