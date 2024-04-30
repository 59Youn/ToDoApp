const express = require('express');
const app = express(); // express() 함수를 app 이라는 변수에 담아서 앞으로 요소들을 꺼내쓸것임
const port = 3000;

const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://wltjs9659:D8sqnztyONoYMZmP@cluster0.y73thdu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

app.set('view engine', 'ejs'); // ejs 초기 세팅 // ejs 파일이 들어있는 폴더가 기본값으로 됨
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // 이 코드와 윗 코드 : body 에 담겨져있는 요소들을 객체형태로 가져오기 위함

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// 쓰기 페이지
app.get('/', (req, res) => {
  // res.send('서버개발시작!'); // send 는 간단한 문장을 보낼 때 사용된다
  // res.sendFile(__dirname + '/index.html');
  res.render('index'); // 그래서 따로 ./ 경로를 쓰지 않아도 됨 // 확장자는 생략 가능함. 모든 확장자를 ejs 로 쓸 것이기 때문에
});

const getDB = async ()=> {
  await client.connect()
  return client.db('todo')
};

app.get('/list', async (req, res) => {
  try {
    const db = await getDB();
    const posts =  await db.collection('posts').find().sort({_id:-1}).toArray();
    // console.log(posts);
    res.render('list', { posts }); // {posts: posts}
  } catch (error) {
    console.error(error);
  }
});

app.post('/add', async (req, res) => {
  console.log(req.body);
  const { title, dateOfGoals, today } = req.body; // 구조분해할당
  // 받아온 정보를 mongodb 에 저장
  try {
    const db = await getDB();
    const result =  await db.collection('counter').findOne({name : "counter"});
    console.log(result.totalPost);
    await db.collection('posts').insertOne({ _id: result.totalPost + 1, title, dateOfGoals, today });
    await db.collection('counter').updateOne({ name: 'counter' }, { $inc: { totalPost: 1 } });
  } catch (error) {
    console.error(error);
  }
  res.redirect('/list');
});

app.get('/detail/:id', async (req, res) => {
  // const id = req.params.id; // 이건 문자열
  const id = parseInt(req.params.id); // _id 를 mongoDB에서 정수형으로 선언해줬기 때문에 바꿔주기
  try {
    const db = await getDB();
    const post = await db.collection('posts').findOne({ _id: id }); // _id : 몽고db의 키값, id : app에서 요청한 id값
    res.render('detail', { post }); // {post: post}
    console.log(post);
  } catch (error) {
    console.error(error);
  }
});

app.post('/delete', async (req, res)=>{
  const id = parseInt(req.body.postNum);
  console.log(id);
  try {
    const db = await getDB();
    await db.collection('posts').deleteOne({_id:id}) // _id : 몽고db의 키값, id : 요청한 id값
    res.redirect('/list');
  } catch(error) {
    console.log(error);
  }
})

// 수정페이지
app.get('/edit/:id', async (req, res)=>{
  const id = parseInt(req.params.id) // 그냥 req.params.id 값은 문자열 // 정수형으로 변경해주기
  console.log('id 확인', id);
  try {
    const db = await getDB();
    const post = await db.collection('posts').findOne({ _id: id });
    res.render('edit', {post})
  } catch(error) {
    console.log(error);
  }
})

// 수정기능
app.post('/update', async (req, res) => {
  const { id, title, dateOfGoals, today } = req.body;
  console.log(id);
  try {
    const db = await getDB();
    await db.collection('posts').updateOne({_id:parseInt(id)},{$set:{title, dateOfGoals, today}})
    res.redirect('/list');
  } catch(error) {
    console.log(error);
  }
})

app.listen(port, () => {
  console.log(`서버실행중... ${port}`);
});

// D8sqnztyONoYMZmP
// npm install mongodb
// mongodb+srv://wltjs9659:D8sqnztyONoYMZmP@cluster0.y73thdu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
