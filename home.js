"use strict";
import "regenerator-runtime/runtime";
import axios from "./util/axiosconfig.js";
import app from "./util/indexfireBase";
import { getAuth } from "firebase/auth";
const auth = getAuth();
const search = document.querySelector(".searchInput");
const input = document.querySelector(".input");
const container = document.querySelector(".list_container");
let alldata = [];
let currentuser;
console.log(alldata);

////logout
const logout = document.querySelector(".logoutbtn");
logout.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "./auth/login.html";
  });
});

////user activitiy
auth.onAuthStateChanged((user) => {
  document.querySelector(".main").classList.remove("d-none");
  if (user) {
    currentuser = user.uid;
    ///getting his own data and displaying it
    axios.get("/list.json").then(({ data }) => {
      const thedata = Object.entries(data);
      for (const [key, value] of thedata) {
        value.id = key;
        alldata.push(value);
      }
      ///displaying it when page reloads
      alldata.forEach((item) => {
        if (item.userid === user.uid) displayContent(item);
      });
    });

    filter(alldata, user.uid);
  }
  if (!user) {
    ///if user doesnt exist
    document.querySelector(".main").classList.add("d-none");
  }
});

///add
document.querySelector(".addbtn").addEventListener("click", () => {
  if (input.value === "") return;
  const item = {
    id: String(Date.now()),
    content: input.value,
    check: false,
    userid: currentuser,
  };
  axios.post("list.json", item).then((res) => {
    item.id = res.data.name;
    alldata.push(item);

    displayContent(item);
  });
  //display item
  //emptying input
  input.value = "";
});

// function that displays the content
const displayContent = function (data) {
  let html = `
    <li
      class="
      item
        list-group-item
        align-items-center
        d-flex
        justify-content-between
      "
    > 
      <div class="content"> ${data.content}
      ${data.check === true ? '<hr class="hr">' : ""}
      </div>
      <div class="d-flex">
        <button data-id=${
          data.id
        } class="btn delete_btn btn-outline-danger mx-1">delete</button>
        <button data-id=${
          data.id
        } class="btn updatebtn btn-outline-primary mx-1">update</button>
       ${
         data.check === false
           ? `<button data-id=${data.id} class="btn btnCheck btn-outline-warning mx-1">check</button>`
           : ""
       }
        
      </div>
    </li>
  `;

  container.innerHTML += html;
};

/// delete btn
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete_btn")) {
    if (window.confirm("are you sure")) {
      //delete from db
      const idTarget = e.target.dataset.id;
      axios.delete("./list/" + idTarget + ".json").then((res) => {
        const newTable = alldata.filter((item) => item.id !== idTarget);
        alldata = newTable;
      });

      ///delete from view
      document
        .querySelector(`.delete_btn[data-id="${idTarget}"]`)
        .parentElement.parentElement.remove();
    }
  }
});

// update btn
let currentId;
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("updatebtn")) {
    const targetId = e.target.dataset.id;
    currentId = targetId;
    document.querySelector(".editOptions").classList.remove("d-none");
    const currentObject = alldata.find((item) => item.id === currentId);
    console.log(currentObject);
    input.value = currentObject.content;
  }
});

document.querySelector(".cancelbtn").addEventListener("click", () => {
  input.value = "";
  document.querySelector(".editOptions").classList.add("d-none");
});
document.querySelector(".editbtn").addEventListener("click", () => {
  const updatedcontent = {
    id: currentId,
    content: input.value,
    check: false,
    userid: currentuser,
  };
  axios.put("list/" + currentId + ".json", updatedcontent);
  const newdata = alldata.find((item) => item.id === currentId);
  newdata.content = input.value;
  document.querySelector(
    `.updatebtn[data-id="${currentId}"]`
  ).parentElement.previousElementSibling.innerHTML = ` ${newdata.content}`;
  input.value = "";
});

//// check
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnCheck")) {
    const elementid = e.target.dataset.id;
    const data = alldata.find((item) => item.id == elementid);
    data.check = true;
    axios.put("list/" + elementid + ".json", data).then((res) => {
      const data = alldata.find((item) => item.id == elementid);
      data.check = true;
    });
    e.target.parentElement.previousElementSibling.innerHTML +=
      '<hr class="hr">';
    e.target.remove();
  }
});

//// search

const filter = function (items, currId) {
  document.querySelector(".searchInput").addEventListener("keyup", () => {
    const items = document.querySelectorAll(".item");
    console.log(search.value);
    items.forEach((item) => {
      if (!item.firstElementChild.textContent.includes(search.value)) {
        item.classList.add("d-none");
      }
    });
    if (search.value === "") {
      container.innerHTML = "";
      alldata.forEach((item) => {
        if (currId === item.userid) displayContent(item);
      });
    }
  });
};
