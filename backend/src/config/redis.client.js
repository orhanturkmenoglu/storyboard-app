import {createClient} from "redis";

const REDIS_URL = process.env.REDIS_URL ||  "redis://127.0.0.1:6379";

const client = createClient({
    url : REDIS_URL
})

client.on("error",(err)=>{
    console.log("Redis Client Error : ",err)
})

  try {
    await client.connect();
    console.log("🚀 Redis connected:", REDIS_URL);
  } catch (error) {
    console.error("❌ Redis connection failed:", error);

    // Uygulamanın çökmemesi için önemli!
    // Eğer hemen crash olsun istiyorsan aşağıdaki satırı aktif et
    // process.exit(1);
  }
export default client;