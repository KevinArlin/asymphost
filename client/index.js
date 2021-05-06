function updateClass() {
  let asy_in = document.getElementById("asy_in");
  if (asy_in.value != "") {
    asy_in.classList.add("has-content");
    document.getElementById("upload").disabled = true;
  } else {
    asy_in.classList.remove("has-content");
    document.getElementById("upload").disabled = false;
  }
}

function displayFiles(files) {
  let zone = document.getElementById("dropzone");

  if (files.length !== 0) {
    zone.classList.add("has-files");
    const list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.padding = "0";
    zone.appendChild(list);

    for (const file of files) {
      const listItem = document.createElement("li");
      const para = document.createElement("p");
      if (file.name.split(".").pop() === "asy") {
        para.textContent = file.name;

        listItem.appendChild(para);
      } else {
        para.textContent = `${file.name}: Not an asy file. Update your selection.`;
        listItem.appendChild(para);
      }

      list.appendChild(listItem);
    }
  }
}

function browseHandler() {
  let input = document.getElementById("upload");
  displayFiles(input.files);
}

function dropHandler(e) {
  let asy_in = document.getElementById("asy_in");
  e.preventDefault();

  // no drag-and-drop if text has been input
  if (asy_in.classList.contains("has-content")) {
    return;
  }

  displayFiles(e.dataTransfer.files);
}

function dragoverHandler(e) {
  e.preventDefault();
}

function clearAll() {
  let oldList = document.querySelector("#dropzone>ul");
  if (oldList !== null) {
    oldList.remove();
  }

  let asy_in = document.getElementById("asy_in");
  let zone = document.getElementById("dropzone");
  zone.classList.remove("has-files");

  asy_in.value = "";
  asy_in.classList.remove("has-content");
  document.getElementById("upload").disabled = false;
}

async function asyToServer(asy, asy_del, asy_em) {
  let response = await fetch("/host-asy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ asy, asy_del, asy_em }),
  });

  if (response.ok) {
    let result = await response.json();
    return { path: result.path, error: result.error, success: result.success };
  } else {
    return { status: response.status };
  }
}

async function submitAsy() {
  let asy_in = document.getElementById("asy_in");
  let asy_delete = document.getElementById("asy_delete");
  let asy_embed = document.getElementById("asy_embed");
  let asy_out = document.getElementById("asy_out");

  let response = await asyToServer(
    asy_in.value,
    asy_delete.checked,
    asy_embed.checked
  );
  if (response.error) {
    asy_out.style.display = "block";
    asy_out.style.color = "red";
    let error_split = response.error.split(".asy:");
    asy_out.textContent = error_split[1];
  } else {
    asy_out.style.display = "block";
    asy_out.style.color = "darkslateblue";
    asy_out.textContent = response.path;
  }
  console.log(response);
}
