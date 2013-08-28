# 七牛 Node.js SDK

该 SDK 适用于 Node.js 0.4.7 及其以上版本，基于 七牛云存储官方API 构建。 若您的服务端是一个基于 Node.js 编写的网络程序，使用此 SDK ， 能让您以非常便捷地方式将数据安全地存储到七牛云存储上。 以便让您应用的终端用户进行高速上传和下载，同时也使得您的服务端更加轻盈。

## 安装

你可以从 npm 进行安装

```shell
npm install node-qiniu
```

也可以从 Github 进行下载安装

```shell
$ git clone git://github.com/qiniu/node-qiniu
$ cd node-qiniu
$ npm install .
```

## 测试

七牛 Node.js SDK 使用 Mocha 进行单元测试。

```shell
$ npm install -g mocha
$ make test
```

## 使用

### 配置 `qiniu.config()`

设置全局参数，包括必须的 AccessKey 和 SecretKey，还可以设置其他如 CallbackURL 等参数，将会顺延至所有空间。

```js
qiniu.config({
  access_key: '------',
  secret_key: '------'
});
```

### Bucket

获得空间对象并进行操作。

```js
var imagesBucket = qiniu.bucket('qiniu-sdk-test');
// 也可以这样操作
// var imagesBucket = new qiniu.Bucket('qiniu-sdk-test');
```

#### 上传文件

**1. `Bucket.putFile()`**

上传一个文件，参数为将要上传的 Key，文件地址(可以是绝对地址，也可以是相对地址)，第三个为可选参数 options，即本次上传中所使用 PutToken 的特殊设置，第四个为可选参数回调(callback)，若不传入回调函数，将由 putFile 函数所返回的 Promise 对象进行响应。

```js
// 普通上传
imagesBucket.putFile('exampleKey', __dirname + '/assets/example.jpg', function(err, reply) {
  if (err) {
    return console.error(err);
  }

  console.dir(reply);
});
// 特殊参数
imagesBucket.putFile('exampleKey_1', __dirname + '/assets/example.jpg', {
  // 为本次上传中所使用的 Token 进行设置，此处为设置上传者标识
  endUser: 'foobar'
}, function(err, reply) {
  if (err) {
    return console.error(err);
  }

  console.dir(reply);
});
// 七牛 Node.js SDK 所提供的 Promise 对象遵循 Promise/A(+) 标准，使用 .then 方法进行响应
imagesBucket.putFile('exampleKey_2', __dirname + '/assets/example.jpg')
  .then(
    function(reply) {
      // 上传成功
      console.dir(reply);
    },
    function(err) {
      // 上传失败
      console.error(err);
    }
  );
```

**2. `Bucket.createPutStream()`**

七牛 Node.js SDK 提供基于流(Stream)的操作方式，为熟悉 Node.js 流式操作的开发者提供方便快捷的高性能 API。

```js
var puttingStream = imagesBucket.createPutStream('exampleKey_3');
var readingStream = fs.createReadStream(__dirname + '/assets/example.jpg');

readingStream.pipe(puttingStream)
  .on('error', function(err) {
    console.error(err);
  })
  .on('end', function(reply) {
    console.dir(reply);
  });
```

#### 下载文件

`Bucket.getFile()`和`Bucket.createGetStream()`

获取文件与上传文件同样简单，和 Node.js 中原生的文件系统(File System)的 API 有相似之处。

```js
imagesBucket.getFile('exampleKey', function(err, data) {
  if (err) {
    return console.error(err);
  }

  // data 为包含文件数据的 Buffer 对象
});
```

同样的，获取文件也可以使用流式操作进行
```js
var gettingStream = imagesBucket.createGetStream('exampleKey');
var writingStream = fs.createWriteStream(__dirname + '/assets/example_tmp.jpg');

gettingStream.pipe(writingStream)
  .on('error', function(err) {
    console.error(err);
  })
  .on('finish', function() {
    // 文件数据已写入本地文件系统
  });
```

### `Image` 图片操作

七牛 Node.js SDK 提供`Image`类，用于对图片资源进行操作。

使用 Bucket.image() 方法获取一个图像对象

```js
var image = imagesBucket.image('exampleKey');
```

#### `Image.imageInfo()`

Image.imageInfo 方法可以用于获取图片资源的图片信息。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageInfo](http://docs.qiniu.com/api/v6/image-process.html#imageInfo)

```js
image.imageInfo(function(err, info) {
  if (err) {
    return console.error(err);
  }

  console.dir(info);
});
```

#### `Image.exif()`

Image.imageView 方法用于生成指定规格的缩略图。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageView](http://docs.qiniu.com/api/v6/image-process.html#imageView)

```js
image.exif(function(err, exif) {
  if (err) {
    return console.error(err);
  }

  console.dir(exif);
});
```

#### `Image.imageView()`

Image.imageView 方法用于生成指定规格的缩略图。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageView](http://docs.qiniu.com/api/v6/image-process.html#imageView)

```js
image.imageView({
  mode    : 2,
  width   : 180,
  height  : 180,
  quality : 85,
  format  : 'jpg'
}, function(err, imageData) {
  if (err) {
    return console.error(err);
  }

  // imageData 为处理过后的图像数据
});
```

其中，图片对象中的所有含图片数据返回的方法可以使用流式操作。不传入第二个的 callback 参数，而在调用方法的括弧后再调用`.stream()`方法，则会返回一个会不断输出数据的 IO 流。

```js
var imageViewStream = image.imageView({
  mode    : 2,
  width   : 180,
  height  : 180,
  quality : 85,
  format  : 'jpg'
}).stream();
var writingStream = fs.createWriteStream(__dirname + '/assets/example_thumbnail.jpg');

imageViewStream.pipe(writingStream)
  .on('error', function(err) {
    console.error(err);
  })
  .on('finish', function() {
    // 缩略图已写入本地文件系统
  });
```

诸如此类：
```js
image.imageMogr(...).stream();
image.watermark(...).stream();
image.alias(...).stream();
```

#### `Image.imageMogr()`

Image.imageMogr 方法用于调用高级图像处理接口，并返回处理后的图片数据。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageMogr](http://docs.qiniu.com/api/v6/image-process.html#imageMogr)

```js
image.imageMogr({
  thumbnail : '300x500',
  gravity   : 'NorthWest',
  crop      : '!300x400a10a10',
  quality   : 85,
  rotate    : 90,
  format    : 'jpg'
}, function(err, imageData) {
  if (err) {
    return console.error(err);
  }

  // 使用 imageData 进行操作
});
```

#### `Image.watermark()`

Image.watermark 方法用于生成一个带有水印的图片，图片水印 API 支持图片水印和文字水印两种模式。
详细请看：http://docs.qiniu.com/api/v6/image-process.html#watermark

```js
image.watermark({
  mode: 1,
  image: 'http://www.b1.qiniudn.com/images/logo-2.png',
  dissolve: 70,
  gravity: 'SouthEast',
  dx: 20,
  dy: 20
}, function(err, imageData) {
  if (err) {
    return console.error(err);
  }

  // 使用 imageData 进行操作
});
```

#### `Image.alias()`

Image.alias 方法用于返回既定的数据处理格式的数据，使用此方法需要在[七牛开发者平台](https://portal.qiniu.com)中对设置进行操作。
其中，`Image.alias()`方法继承于 key 所用的`Asset`类。

```js
image.alias('testalias', function(err, imageData) {
  if (err) {
    return console.error(err);
  }

  // 使用 imageData 进行操作
});
```

### `Asset` 资源操作

七牛 Node.js SDK 提供一个`Asset`类，用于对所属资源进行操作。

获取 key 所对应资源对象
```js
var picture = imagesBucket.key('exampleKey');
```

#### `Asset.url()`

`Asset.url()`方法可以获得该资源的 URL 地址以用于访问

```js
var picUrl = picture.url();
```

#### `Asset.entryUrl()`

`Asset.entryUrl()`方法可以获得该资源用于 API 调用时所需的 EncodedEntryURL。
但是在 Node.js SDK 中，大部分 API 都不需要开发者自行使用。:)

```js
var encodedPicUrl = picture.entryUrl();
```

#### `Asset.stat()`

Asset.stat 方法可以获得该资源的如文件大小、MIME 类型等 stat 数据。

```js
picture.stat(function(err, stat) {
  if (err) {
    return console.error(err);
  }

  console.dir(stat);
  /**
   * {
   *   hash     : <FileEtag>, // string 类型，文件的Hash值
   *   fsize    : <FileSize>, // int 类型，文件的大小(单位: 字节)
   *   mimeType : <MimeType>, // string 类型，文件的媒体类型，比如"image/gif"
   *   putTime  : <PutTime>   // int64 类型，文件上传到七牛云的时间(Unix时间戳)
   * }
   */
});
```

#### `Asset.move()`

`Asset.move()`方法用于移动该资源到指定的位置。
第一个参数可以是来自其他 Bucket 所属的资源对象。

```js
picture.move(imagesBucket.key('exampleKey_4'), function(err) {
  if (err) {
    return console.error(err);
  }

  // 此处没有返回值，如果没有错误，则为操作成功，以下方法相同
});
```

#### `Asset.copy()`

`Asset.copy()`方法用于为该资源创建一个拷贝，并保存到指定的资源位置。

```js
imagesBucket.key('exampleKey_4').copy(picture, function(err) {
  if (err) {
    return console.error(err);
  }
});
```

#### `Asset.remove()`

`Asset.remove()`方法用于删除当前资源。

```js
imagesBucket.key('exampleKey_4').remove(function(err) {
  if (err) {
    return console.error(err);
  }
});
```

### `Batch` 资源批量操作

在支持对单个文件资源操作的同时，七牛云存储还支持批量地对多个文件进行查看、删除、复制和移动操作。
详细请看：http://docs.qiniu.com/api/v6/rs.html#batch

生成一个批量操作的控制器
```js
var batch = qiniu.batch();
```

`Batch`中大部分参数与资源对象`Asset`类似，支持查看、移动、复制和删除操作。

```js
batch
  // 获取文件信息
  .stat(imagesBucket.key('exampleKey'))
  // 移动资源
  .move(imagesBucket.key('exampleKey'), imagesBucket.key('exampleKey_5'))
  // 复制资源
  .copy(imagesBucket.key('exampleKey_5'), imagesBucket.key('exampleKey'))
  // 删除资源
  .remove(imagesBucket.key('exampleKey_5'))
  // 执行操作
  // 每一个操作都按照前后顺序进行执行
  .exec(function(err, results) {
    if (err) {
      return console.error(err);
    }

    console.dir(results);
    // results 为每一个操作的结果
  });
```

### `Fop` 管道操作

七牛云存储提供一个非常实用的资源处理 API，可以用于对资源进行多种处理的操作。

例: 将一个原图缩略，然后在缩略图上打上另外一个图片作为水印

使用`Asset.fop()`方法创建 Fop 管道操作器，并进行操作。

```js
var image = imagesBucket.key('exampleKey');
// Image.fop 方法继承于 Asset 类

image.fop()
  // 对图片进行缩略
  .imageView({
    mode   : 2,
    height : 200
  })
  // 为图片打上水印
  .watermark({
    mode  : 1,
    image : 'http://www.b1.qiniudn.com/images/logo-2.png'
  })
  // 执行操作
  .exec(function(err, imageData) {
    if (err) {
      return console.error(err);
    }

    // imageData 为已打上水印的缩略图数据
  });
```

## 模块结构
![模块结构](http://ww2.sinaimg.cn/large/7287333fgw1e8263cvxeaj20mr0glgmp.jpg)

## License 

    (The MIT License)
    
    Copyright (c) 2010-2013 Will Wen Gunn <willwengunn@gmail.com> and other contributors
    
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    'Software'), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:
    
    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
