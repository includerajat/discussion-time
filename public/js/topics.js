const $btns = document.querySelectorAll("button");
const $input = document.querySelector("input");
const $form = document.querySelector("form");

$inputUsername = document.querySelector("input");
if (localStorage.getItem("username")) {
  $inputUsername.value = localStorage.getItem("username");
}
$inputUsername.addEventListener("change", () => {
  localStorage.setItem("username", $inputUsername.value);
});

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  $btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.innerText;
      const username = $input.value;
      location.href = `/chat.html?username=${encodeURIComponent(
        username
      )}&room=${encodeURIComponent(text)}&roomType=public&theme=true`;
    });
  });
});
