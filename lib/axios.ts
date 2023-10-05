import axios from "axios";
import https from "https";

export default axios.create({
  baseURL: process.env.NEXT_PUBLIC_VROPS_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
