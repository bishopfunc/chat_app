'use strict'
// const firebase = require("firebase");
// // Required for side-effects
// require("firebase/firestore");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyDE8bxe2u0IFzwsUE9H7MSKCG7g40y5Gy0",
  authDomain: "blog-app-65487.firebaseapp.com",
  projectId: "blog-app-65487",
  storageBucket: "blog-app-65487.appspot.com",
  messagingSenderId: "168701314762",
  appId: "1:168701314762:web:41045924dc0e9092391633",
  measurementId: "G-X1ZQRNK878"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});
//timestampsInSnapshotsなんかよくわからん
var auth = firebase.auth();
let me = null;

var collection = db.collection('messages'); //messagesという表
var message = document.getElementById('message');
var form = document.querySelector('form');//要素の取得,cssも可
var messages = document.getElementById('messages');//要素の取得,cssも可
var login = document.getElementById('login');
var logout = document.getElementById('logout');

login.addEventListener('click', ()=>{
  auth.signInAnonymously();
})

logout.addEventListener('click', ()=>{
  auth.signOut();
})

auth.onAuthStateChanged(user =>{
  if (user){
    me = user;

    while (messages.firstChild) {
      messages.removeChild(messages.firstChild);
    }
    
    collection.orderBy('created').onSnapshot(snapshot => {
      //onSnapshotを実行すると最初に全てのドキュメントを取得します 
      snapshot.docChanges().forEach(change => {
        //orderBy
        //then,Promis?
        if (change.type === 'added') {
          var li = document.createElement('li');//snapshot 「場所」ではなく、実際のデータのこと（オブジェクトとは言ってない）
          //querySelectorAll()+forEach()
          var data = change.doc.data();
          li.textContent = data.userid.substr(0,8) + ':' + data.message;//snapshot.data/snapshot.ref  
          //    message: message.value
          messages.appendChild(li);     
        }
      });
    }, error =>{});
    //collection.orderBy('created').onSnapshot.docChanges().forEach().doc.data().message

    console.log(`Logged in as: ${user.uid}`);
    login.classList.add('hidden');
    [logout, form, messages].forEach(el => {
      el.classList.remove('hidden');
    });
    message.focus();
    return;
  }
  me = null;
  console.log('Nobody is logged in');
  login.classList.remove('hidden');
  // form.classList.remove('hidden');
  [logout, form, messages].forEach(el => {
    el.classList.add('hidden');
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  //デフォルトアクションをキャンセルする場合、二重送信防止
  //順番に気をつけないと、scriptが読み込まれないと

  var val = message.value.trim();
  if (val === "") {
    return;
  } 

  // var li = document.createElement('li');//snapshot 「場所」ではなく、実際のデータのこと（オブジェクトとは言ってない）
  // li.textContent = val;//snapshot.data/snapshot.ref  
  // messages.appendChild(li);
  //submit イベントは <form> 要素自身で発生するものであり、その中の <button> や <input type="submit"> で発生するものではない
  //submit イベントは、ユーザーが送信ボタン (<button> または <input type="submit">) を押したり、 Enter キーをフォーム内のフィールド (例えば <input type="text">) の編集中に押したりしたときに発生します。
  
  message.value = ""; //リセットする
  message.focus();//入力可能

  collection.add({
    message: val,// trim()
    created: firebase.firestore.FieldValue.serverTimestamp(), //FieldValue
    userid: me ? me.uid : 'nobody' //me true:false
  })
  .then((doc) => {
    console.log(`${doc.id} added!`);//docはどこで定義？
    //外に出す
  })
  .catch((error) => {
    console.error("Error adding document: ", error);
  });
});
