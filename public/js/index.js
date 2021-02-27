const $dropDown = document.querySelector("#publicRooms");

let rooms;

io().on("rooms", (room) => {
  rooms = room;
  for (let room of rooms) {
    const option = document.createElement("option");
    $dropDown.insertAdjacentElement("beforeend", option);
    option.value = room;
    option.innerText = room;
  }
});

$inputUsername = document.querySelector("#display-name");
if (localStorage.getItem("username")) {
  $inputUsername.value = localStorage.getItem("username");
}
$inputUsername.addEventListener("change", () => {
  localStorage.setItem("username", $inputUsername.value);
});
const $inputRoom = document.querySelector("#room");
const $publicRooms = document.querySelector("#publicRooms");

$inputRoom.addEventListener("keyup", () => {
  if ($inputRoom.value.trim() !== "") {
    $publicRooms.setAttribute("disabled", "disabled");
  } else {
    $publicRooms.removeAttribute("disabled");
  }
});

$publicRooms.addEventListener("change", () => {
  if ($publicRooms.value !== "no") {
    $inputRoom.setAttribute("disabled", "disabled");
    document.querySelector("#private").setAttribute("disabled", "disabled");
  } else {
    $inputRoom.removeAttribute("disabled");
    document.querySelector("#private").removeAttribute("disabled");
  }
});

const i1 = document.querySelector(".fa-thumbs-up");
const i2 = document.querySelector(".fa-thumbs-down");
if (localStorage.getItem("reaction")) {
  i1.style.cursor = "not-allowed";
  i2.style.cursor = "not-allowed";
  const reaction = localStorage.getItem("reaction");
  if (reaction === "positive") {
    i1.classList.remove("far");
    i1.classList.add("fas");
  } else {
    i2.classList.remove("far");
    i2.classList.add("fas");
  }
}
i1.addEventListener("click", () => {
  if (!localStorage.getItem("isLiked")) {
    i1.classList.remove("far");
    i1.classList.add("fas");
    localStorage.setItem("isLiked", true);
    localStorage.setItem("reaction", "positive");
  }
});
i2.addEventListener("click", () => {
  if (!localStorage.getItem("isLiked")) {
    i2.classList.remove("far");
    i2.classList.add("fas");
    localStorage.setItem("isLiked", true);
    localStorage.setItem("reaction", "negative");
  }
});
