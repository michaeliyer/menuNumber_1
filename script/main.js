import { initDB, saveMenu, getAllMenus, deleteMenu, getMenu } from "./db.js";

// Initialize database and set up event listeners
initDB()
  .then(() => {
    document
      .getElementById("menuForm")
      .addEventListener("submit", handleSubmit);
    // Load menus when page loads
    listMenus();
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    alert("Failed to initialize database. Please refresh the page.");
  });

let currentStyleSettings = null;

function addItem(section) {
  const container = document.getElementById(section);
  const index = container.children.length;

  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" placeholder="Name" name="${section}-name-${index}" required>
    <input type="text" placeholder="Price" name="${section}-price-${index}" required>
    <input type="text" placeholder="Ingredients" name="${section}-ingredients-${index}">
    <input type="text" placeholder="Description" name="${section}-description-${index}">
    <br><br>
  `;
  container.appendChild(div);
}

function handleSubmit(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const type = form.get("type");
  const date = form.get("date");
  const background = form.get("background");
  const id = `${date}_${type}`;

  const getItems = (section) => {
    const container = document.getElementById(section);
    return Array.from(container.children).map((div) => {
      const inputs = div.querySelectorAll("input");
      return {
        name: inputs[0].value,
        price: inputs[1].value,
        ingredients: inputs[2].value,
        description: inputs[3].value,
      };
    });
  };

  const menu = {
    id,
    type,
    date,
    background,
    items: {
      appetizers: getItems("appetizers"),
      entrees: getItems("entrees"),
      desserts: getItems("desserts"),
    },
    styleSettings: currentStyleSettings || undefined,
  };

  saveMenu(menu)
    .then(() => {
      alert(`Menu "${id}" saved!`);
      e.target.reset();
      ["appetizers", "entrees", "desserts"].forEach((id) => {
        document.getElementById(id).innerHTML = "";
      });
      currentStyleSettings = null;
      listMenus();
    })
    .catch((error) => {
      console.error("Error saving menu:", error);
      alert("Error saving menu. Please try again.");
    });
}

window.addItem = addItem;

window.listMenus = function () {
  getAllMenus()
    .then((menus) => {
      const ul = document.getElementById("savedMenusList");
      ul.innerHTML = "";

      if (!menus || menus.length === 0) {
        ul.innerHTML = "<li>No saved menus yet</li>";
        return;
      }

      menus.forEach((menu) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `view.html?id=${menu.id}`;
        a.textContent = `${menu.date} - ${menu.type}`;
        a.target = "_blank";
        li.appendChild(a);

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.marginLeft = "1em";
        editBtn.onclick = async function () {
          const loadedMenu = await getMenu(menu.id);
          if (!loadedMenu) return alert("Menu not found");
          document.querySelector('[name="type"]').value = loadedMenu.type;
          document.querySelector('[name="date"]').value = loadedMenu.date;
          document.querySelector('[name="background"]').value =
            loadedMenu.background;
          ["appetizers", "entrees", "desserts"].forEach((section) => {
            const container = document.getElementById(section);
            container.innerHTML = "";
            (loadedMenu.items[section] || []).forEach((item, idx) => {
              const div = document.createElement("div");
              div.innerHTML = `
                <input type="text" placeholder="Name" name="${section}-name-${idx}" required value="${
                item.name || ""
              }">
                <input type="text" placeholder="Price" name="${section}-price-${idx}" required value="${
                item.price || ""
              }">
                <input type="text" placeholder="Ingredients" name="${section}-ingredients-${idx}" value="${
                item.ingredients || ""
              }">
                <input type="text" placeholder="Description" name="${section}-description-${idx}" value="${
                item.description || ""
              }">
                <br><br>
              `;
              container.appendChild(div);
            });
          });
          // Store styleSettings for persistence
          currentStyleSettings = loadedMenu.styleSettings || null;
        };
        li.appendChild(editBtn);

        // Delete button
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.marginLeft = "0.5em";
        delBtn.onclick = async function () {
          if (confirm(`Delete menu ${menu.date} - ${menu.type}?`)) {
            await deleteMenu(menu.id);
            listMenus();
          }
        };
        li.appendChild(delBtn);

        ul.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error loading menus:", error);
      document.getElementById("savedMenusList").innerHTML =
        "<li>Error loading menus. Please try again.</li>";
    });
};
