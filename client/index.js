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
