const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $button = document.querySelector("button");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const urlTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room, roomType, theme, invite } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
document.querySelector("title").innerText = room.split("~")[0];
document.querySelector("form").classList.add("display");

if (roomType === "public") {
  $button.style.display = "none";
}
$button.addEventListener("click", () => {
  document.querySelector("form").classList.toggle("formDisplay");
  document.querySelector("#inviteLink").classList.toggle("formDisplay");
  document.querySelector("form").querySelector("input").placeholder =
    "Enter name";
  document.querySelector("#inviteLink").value = "";
});

const mainArea = document.querySelector(".chat__main");

if (document.body.clientWidth <= 900) {
  document.querySelector("#sidebar").classList.toggle("display");
}
document.querySelector(".touch").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("display");
});
document.querySelector(".touch2").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("display");
});
document.querySelector(".touch3").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("display");
});
socket.on("api_key", (key) => {
  const unsplash = axios.create({
    baseURL: "https://api.unsplash.com",
    headers: {
      Authorization: `Client-ID ${key}`,
    },
  });
  if (theme) {
    unsplash
      .get("/search/photos", {
        params: { query: room.split(" ")[0] },
      })
      .then(({ data }) => {
        if (data.results.length === 0) {
          unsplash
            .get("/search/photos", {
              params: { query: "nature" },
            })
            .then(({ data }) => {
              const imgArr = data.results;
              const random = Math.floor(Math.random() * 10);
              const imgUrl = imgArr[random].urls.regular;
              mainArea.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url(${imgUrl})`;
              mainArea.style.backgroundSize = "cover";
              mainArea.style.backgroundAttachment = "fixed";
              mainArea.style.backgroundPosition = "center";
            });
        } else {
          const imgArr = data.results;
          const random = Math.floor(Math.random() * 10);
          const imgUrl = imgArr[random].urls.regular;
          mainArea.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url(${imgUrl})`;
          mainArea.style.backgroundSize = "cover";
          mainArea.style.backgroundAttachment = "fixed";
          mainArea.style.backgroundPosition = "center";
        }
      });
  } else {
    unsplash
      .get("/search/photos", {
        params: { query: "black" },
      })
      .then(({ data }) => {
        const imgArr = data.results;
        const random = Math.floor(Math.random() * 10);
        const imgUrl = imgArr[random].urls.regular;
        mainArea.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url(${imgUrl})`;
        mainArea.style.backgroundSize = "cover";
        mainArea.style.backgroundAttachment = "fixed";
        mainArea.style.backgroundPosition = "center";
      });
  }
});

const messageDelete = () => {
  const allDivs = $messages.querySelectorAll("div");
  allDivs.forEach((div) => {
    div.addEventListener("dblclick", (e) => {
      const style = getComputedStyle(div);
      if (style.textAlign === "right") {
        div.style.display = "none";
      }
    });
  });
};

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom) + 16;
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;

  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", ({ text, createdAt, username, profanity }) => {
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();

  if (username === "You") {
    $messages.lastElementChild.style.textAlign = "right";
    if (profanity === true) {
      $messages.lastElementChild
        .querySelector(".btn")
        .classList.add("btn-warning");
    }
  } else if (username === "Admin") {
    $messages.lastElementChild.style.textAlign = "center";
    $messages.lastElementChild
      .querySelector(".btn")
      .classList.add("btn-secondary");
  } else {
    $messages.lastElementChild
      .querySelector(".btn")
      .classList.add("btn-secondary");
  }

  $messages.lastElementChild.querySelector("span").style.backgroundColor =
    "white";
  messageDelete();
});
socket.on("locationMessage", ({ url, createdAt, username }) => {
  const html = Mustache.render(urlTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
  if (username === "You") {
    $messages.lastElementChild.style.textAlign = "right";
  }
  $messages.lastElementChild.querySelector("span").style.backgroundColor =
    "white";
});
let roomName = "";
socket.on("roomData", ({ room, users, roomType }) => {
  roomName = room;
  console.log(roomType);
  if (roomType === "private") {
    room = room.split("~")[0];
  }
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const newUsername = e.target.elements.newUsername.value;
  e.target.elements.newUsername.value = "";
  e.target.elements.newUsername.placeholder = "copy bottom link";
  console.log(newUsername);
  const inviteURL = `https://discussion-time.herokuapp.com/chat.html?username=${newUsername}&room=${roomName}&roomType=${roomType}&theme=${theme}&invite=true`;
  document.querySelector("#inviteLink").value = inviteURL;
  document.querySelector("#inviteLink").style.color = "black";
});
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    // $messageFormInput.focus();

    if (error) {
      return;
    }
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    const { latitude: lat, longitude: long } = coords;
    socket.emit(
      "sendLocation",
      {
        lat,
        long,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room, roomType, invite }, (error) => {
  if (error) {
    location.href = "/";
    alert(error);
  }
});

socket.on("error", () => {
  location.href = "/";
});
