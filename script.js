// Initialize Supabase - this is the main issue
const supabaseClient = supabase.createClient(
  "https://qqynppqnammevenoqafb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeW5wcHFuYW1tZXZlbm9xYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg3NzEsImV4cCI6MjA2NDY2NDc3MX0.gc-r2IQRdm-vtBlTL7_FduESx6sBfaAjGn6Hr2IBzME"
);

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  if (error) alert(error.message);
  else alert("Signup successful! Please check your email.");
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) alert(error.message);
  else {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("upload-section").style.display = "block";
    document.getElementById("username").textContent = email.split("@")[0];
    listImages();
  }
}

async function uploadImage() {
  const file = document.getElementById("file-input").files[0];
  if (!file) {
    alert("Please select a file to upload");
    return;
  }

  const checkType = document.getElementById("check-type").value;

  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (!sessionData.session) {
    alert("You must be logged in to upload images");
    return;
  }

  const email = sessionData.session.user.email;
  const username = email.split("@")[0];

  const today = new Date();
  const dateStr = `${(today.getMonth() + 1).toString().padStart(2, "0")}${today
    .getDate()
    .toString()
    .padStart(2, "0")}${today.getFullYear()}`;

  const filename = `${username}_${dateStr}_check_${checkType}.jpg`;

  const { error } = await supabaseClient.storage
    .from("images")
    .upload(filename, file, { upsert: true });

  if (error) alert("Upload failed: " + error.message);
  else {
    alert("Upload successful!");
    listImages();
  }
}

async function listImages() {
  const { data, error } = await supabaseClient.storage.from("images").list();

  if (error) {
    console.error("Error listing images:", error);
    return;
  }

  if (data) {
    const list = document.getElementById("image-list");
    list.innerHTML = "";

    for (const item of data) {
      const { data: urlData, error: urlError } = await supabaseClient.storage
        .from("images")
        .createSignedUrl(item.name, 3600);

      if (urlError) {
        console.error("Error creating signed URL:", urlError);
        continue;
      }

      const link = document.createElement("a");
      link.href = urlData.signedUrl;
      link.textContent = "Download " + item.name;
      link.download = item.name;
      link.target = "_blank";

      list.appendChild(link);
      list.appendChild(document.createElement("br"));
    }
  }
}
