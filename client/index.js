let submission = new FormData();
let id = uuid.v4();
let numFiles;

submission.append("id", id);

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
    numFiles = 0;
    zone.classList.add("has-files");

    if (files.length > 1) {
      const msg = document.createElement("p");
      msg.textContent = "Select main document for compilation:";
      msg.style.fontWeight = "900";
      msg.setAttribute("id", "msg");
      zone.appendChild(msg);
    }

    const list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.padding = "0";
    zone.appendChild(list);

    for (const file of files) {
      const listItem = document.createElement("li");
      const lbl = document.createElement("label");
      if (file.name.split(".").pop() === "asy") {
        numFiles += 1;
        lbl.innerHTML = file.name;
        if (files.length > 1) {
          const radio = document.createElement("input");
          radio.setAttribute("type", "radio");
          radio.setAttribute("name", "mainFile");
          radio.setAttribute("value", file.name);
          radio.setAttribute("id", file.name);
          lbl.setAttribute("for", file.name);
          listItem.appendChild(radio);
        }
        listItem.appendChild(lbl);
        submission.append(file.name, file);
      } else {
        lbl.innerHTML = `${file.name}: Not an asy file. Update your selection.`;
        listItem.appendChild(lbl);
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
  let zone = document.getElementById("dropzone");
  e.preventDefault();

  // no drag-and-drop if text has been input
  if (
    asy_in.classList.contains("has-content") ||
    zone.classList.contains("has-files")
  ) {
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

  let oldMsg = document.getElementById("msg");
  if (oldMsg !== null) {
    oldMsg.remove();
  }

  let asy_in = document.getElementById("asy_in");
  let zone = document.getElementById("dropzone");
  zone.classList.remove("has-files");

  asy_in.value = "";
  asy_in.classList.remove("has-content");
  document.getElementById("upload").disabled = false;

  submission = new FormData();
  id = uuid.v4();
  submission.append("id", id);
}

async function textToServer(asy, asy_del, asy_em) {
  let response = await fetch("/host-asy-text", {
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

async function filesToServer(sub) {
  let response = await fetch("/host-asy-files", {
    method: "POST",
    body: sub,
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
  let zone = document.getElementById("dropzone");

  let asy_delete = document.getElementById("asy_delete");
  let asy_embed = document.getElementById("asy_embed");

  let asy_out = document.getElementById("asy_out");

  if (asy_in.classList.contains("has-content")) {
    let response = await textToServer(
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
  } else if (zone.classList.contains("has-files")) {
    // check radio buttons, if one isn't selected, show alert
    if (numFiles > 1) {
      let mainFile = document.querySelector("input[name='mainFile']:checked");
      if (mainFile !== null) {
        console.log(mainFile.value);
        submission.append("main", mainFile.value);
      } else {
        alert("You must select a main document for compilation");
        return;
      }
    }
    submission.append("asy_del", asy_delete.checked);
    submission.append("asy_em", asy_embed.checked);

    let response = await filesToServer(submission);
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
  } else {
    alert("No content submitted");
  }
}
