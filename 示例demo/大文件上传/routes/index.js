// fs 的替代品 fs-extra
const router = require("koa-router")();
const fse = require("fs-extra");
const fs = require("fs");
const path = require("path");

const mkdirsSync = (dirname) => {
  if (fse.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      // 递归创建所有不存在的目录
      fse.mkdirSync(dirname); // 创建目录
      return true;
    }
  }
};

const uploadPath = path.resolve(__dirname, "../upload");

router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "Hello Koa 2!",
  });
});

// 路由
router.post("/upload-big-file", async (ctx, next) => {
  const { timestamp, chunkname, name, size, total, index } = ctx.request.body;

  // 根据文件名和时间戳, 在upload录创建临时文件夹存储分片数据
  const chunksPath = path.resolve(
    uploadPath,
    `file_temp_${name}_${timestamp}/`
  );

  if (!fse.existsSync(chunksPath)) {
    // 如果文件夹不存在, 创建文件夹
    mkdirsSync(chunksPath);
  }

  const file = ctx.request.files.file; // 前端上传的文件
  const data = fs.readFileSync(file.path); // 获取文件数据
  fs.writeFileSync(
    // 写到upload下的临时文件夹钟
    path.resolve(chunksPath, `${chunkname}-${total}-${timestamp}`),
    data,
    () => {
      // err
    }
  );

  ctx.body = {
    code: 1,
    msg: "上传成功，可继续传输",
  };
});

// 合并文件
router.post("/upload-big-file-finished", async (ctx, next) => {
  const { timestamp, name, total, size } = ctx.request.body;

  const chunksPath = path.resolve(
    uploadPath,
    `file_temp_${name}_${timestamp}/`
  ); // 分片文件夹路径
  const savedFilePath = path.resolve(uploadPath, `${timestamp}-${name}`); // 合并分片后, 文件要存储在哪里(包括文件名称)
  const chunks = fs.readdirSync(chunksPath); // 读取目录的内容 ['1.txt', '2.png']

  if (chunks.length != total || chunks.length === 0) {
    // 分片数据个数 和 前端传的total不一致代表数据有问题, 不能合并
    ctx.body = {
      code: 1,
      msg: "切片文件数量不符合",
    };
    chunks.forEach((item) => {
      fs.unlinkSync(chunksPath + "/" + item); // 删除文件或符号链接
    });
    fs.rmdirSync(chunksPath); // 删除文件夹
  } else {
    for (let i = 0; i < total; i++) {
      // 能合并
      // 拼接分片文件的路径, ${i} 是因为前端传分片时, 会添加分片索引: fname.0  fname.1
      let chunkFilePath = path.resolve(
        chunksPath,
        `${name}.${i}-${total}-${timestamp}`
      );
      fs.appendFileSync(savedFilePath, fs.readFileSync(chunkFilePath)); // 追加写入文件数据
      fs.unlinkSync(chunkFilePath); // 写入完成后, 删除对应的分片
    }
    fs.rmdirSync(chunksPath); // 删除文件夹
  }

  ctx.body = {
    code: 1,
    msg: "切片文件合并成功",
    data: {
      url: `${timestamp}-${name}`,
    },
  };
});
module.exports = router;
