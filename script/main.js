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
    <input type="text" placeholder="Ingredients (optional)" name="${section}-ingredients-${index}">
    <input type="text" placeholder="Description (optional)" name="${section}-description-${index}">
    <button type="button" onclick="deleteItem('${section}', this)" class="delete-btn">Delete</button>
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

window.deleteItem = function (section, button) {
  if (confirm("Are you sure you want to delete this menu item?")) {
    const itemDiv = button.parentElement;
    itemDiv.remove();

    // Re-index the remaining items in the section
    const container = document.getElementById(section);
    Array.from(container.children).forEach((div, newIndex) => {
      const inputs = div.querySelectorAll("input");
      inputs[0].name = `${section}-name-${newIndex}`;
      inputs[1].name = `${section}-price-${newIndex}`;
      inputs[2].name = `${section}-ingredients-${newIndex}`;
      inputs[3].name = `${section}-description-${newIndex}`;
    });
  }
};

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

        // Export button
        const exportBtn = document.createElement("button");
        exportBtn.textContent = "Export";
        exportBtn.className = "export-btn";
        exportBtn.onclick = function () {
          exportSingleMenu(menu.id);
        };
        li.appendChild(exportBtn);

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
                <input type="text" placeholder="Ingredients (optional)" name="${section}-ingredients-${idx}" value="${
                item.ingredients || ""
              }">
                <input type="text" placeholder="Description (optional)" name="${section}-description-${idx}" value="${
                item.description || ""
              }">
                <button type="button" onclick="deleteItem('${section}', this)" class="delete-btn">Delete</button>
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

// ==================== IMPORT/EXPORT FUNCTIONALITY ====================

// Global variable to store current export data
let currentExportData = null;
let currentExportType = null;

// Export a single menu
window.exportSingleMenu = async function (menuId) {
  try {
    const menu = await getMenu(menuId);
    if (!menu) {
      alert("Menu not found!");
      return;
    }

    const defaultFilename = `menu_${menu.date}_${menu.type.toLowerCase()}`;
    showExportDialog(
      "single",
      menu,
      defaultFilename,
      `Single menu: ${menu.date} - ${menu.type}`
    );
  } catch (error) {
    console.error("Error exporting menu:", error);
    alert("Error exporting menu. Please try again.");
  }
};

// Export all menus
window.exportAllMenus = async function () {
  try {
    const menus = await getAllMenus();
    if (!menus || menus.length === 0) {
      alert("No menus to export!");
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      menuCount: menus.length,
      menus: menus,
    };

    const defaultFilename = `all_menus_${
      new Date().toISOString().split("T")[0]
    }`;
    showExportDialog(
      "all",
      exportData,
      defaultFilename,
      `All menus (${menus.length} total)`
    );
  } catch (error) {
    console.error("Error exporting all menus:", error);
    alert("Error exporting menus. Please try again.");
  }
};

// Show export dialog
function showExportDialog(type, data, defaultFilename, preview) {
  currentExportData = data;
  currentExportType = type;

  document.getElementById("exportDialogTitle").textContent =
    type === "single"
      ? "📦 Export Menu"
      : type === "all"
      ? "📦 Export All Menus"
      : type === "selected"
      ? "📦 Export Selected Menus"
      : "📦 Export Selected Items";

  document.getElementById("exportFilename").value = defaultFilename;
  document.getElementById("exportPreviewText").textContent = preview;
  document.getElementById("exportPreview").style.display = "block";

  // Update export location info based on API availability
  const exportInfo = document.querySelector(".export-info");
  const apiAvailable = "showSaveFilePicker" in window;

  if (apiAvailable) {
    exportInfo.style.borderColor = "#27ae60";
    exportInfo.style.backgroundColor = "#e8f5e8";
    const existingStatus = exportInfo.querySelector(".api-status");
    if (!existingStatus) {
      const statusDiv = document.createElement("p");
      statusDiv.className = "api-status";
      statusDiv.innerHTML =
        "<strong>✅ Advanced:</strong> File location picker available! You can choose exactly where to save.";
      statusDiv.style.color = "#27ae60";
      statusDiv.style.fontWeight = "600";
      exportInfo.insertBefore(statusDiv, exportInfo.firstChild);
    }
  }

  document.getElementById("exportDialog").style.display = "flex";

  // Focus the filename input and select the text for easy editing
  setTimeout(() => {
    const input = document.getElementById("exportFilename");
    input.focus();
    input.select();
  }, 100);
}

// Close export dialog
window.closeExportDialog = function () {
  document.getElementById("exportDialog").style.display = "none";
  currentExportData = null;
  currentExportType = null;
};

// Generate timestamp filename
window.generateTimestampFilename = function () {
  const input = document.getElementById("exportFilename");
  const currentValue = input.value.replace(".json", "");
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  input.value = `${currentValue}_${timestamp}`;
  input.focus();
};

// Validate and sanitize filename
function sanitizeFilename(filename) {
  // Remove or replace invalid characters
  return filename
    .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid characters with underscores
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .substring(0, 100); // Limit length to 100 characters
}

// Confirm export with custom filename
window.confirmExport = function () {
  const rawFilename = document.getElementById("exportFilename").value.trim();
  if (!rawFilename) {
    alert("Please enter a filename!");
    return;
  }

  // Sanitize the filename
  const sanitizedFilename = sanitizeFilename(rawFilename);
  if (!sanitizedFilename) {
    alert("Please enter a valid filename with alphanumeric characters!");
    return;
  }

  // Add .json extension if not present
  const filename = sanitizedFilename.endsWith(".json")
    ? sanitizedFilename
    : `${sanitizedFilename}.json`;

  // Show feedback if filename was changed
  if (sanitizedFilename !== rawFilename.replace(".json", "")) {
    const proceed = confirm(
      `Filename was sanitized for compatibility:\n\n` +
        `Original: "${rawFilename}"\n` +
        `Sanitized: "${filename}"\n\n` +
        `Proceed with export?`
    );
    if (!proceed) return;
  }

  if (currentExportData && currentExportType) {
    downloadJSON(currentExportData, filename);
    closeExportDialog();

    const itemCount =
      currentExportType === "items"
        ? currentExportData.itemCount
        : currentExportType === "single"
        ? 1
        : currentExportData.menuCount;

    const itemType = currentExportType === "items" ? "items" : "menus";

    // Show success message with file location info
    const apiAvailable = "showSaveFilePicker" in window;
    const locationText = apiAvailable
      ? "to your chosen location"
      : "to your Downloads folder (or browser default)";

    alert(
      `✅ Successfully exported ${itemCount} ${itemType} ${locationText}!\n\nFilename: "${filename}"`
    );
  }
};

// Close dialog when clicking outside
document.addEventListener("click", function (event) {
  const dialog = document.getElementById("exportDialog");
  if (event.target === dialog) {
    closeExportDialog();
  }
});

// Handle Enter key in filename input
document.addEventListener("keydown", function (event) {
  if (
    event.key === "Enter" &&
    document.getElementById("exportDialog").style.display === "flex"
  ) {
    confirmExport();
  } else if (event.key === "Escape") {
    closeExportDialog();
  }
});

// Show bulk export dialog
window.showBulkExportDialog = async function () {
  try {
    const menus = await getAllMenus();
    if (!menus || menus.length === 0) {
      alert("No menus available for export!");
      return;
    }

    const dialog = document.getElementById("bulkExportDialog");
    const listContainer = document.getElementById("menuSelectionList");

    listContainer.innerHTML = "";

    menus.forEach((menu, index) => {
      const div = document.createElement("div");
      div.className = "menu-item";
      div.innerHTML = `
        <label>
          <input type="checkbox" class="menu-checkbox" data-menu-id="${
            menu.id
          }" id="menu-${index}">
          <strong>${menu.date} - ${menu.type}</strong>
          <span style="color: #666; margin-left: 1rem;">
            (${
              (menu.items.appetizers?.length || 0) +
              (menu.items.entrees?.length || 0) +
              (menu.items.desserts?.length || 0)
            } items)
          </span>
        </label>
      `;
      listContainer.appendChild(div);
    });

    dialog.style.display = "block";
  } catch (error) {
    console.error("Error showing bulk export dialog:", error);
    alert("Error loading menus for selection.");
  }
};

// Hide bulk export dialog
window.hideBulkExportDialog = function () {
  document.getElementById("bulkExportDialog").style.display = "none";
};

// Select/deselect all menus
window.selectAllMenus = function (selectAll) {
  const checkboxes = document.querySelectorAll(".menu-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAll;
  });
};

// Export selected menus
window.exportSelectedMenus = async function () {
  try {
    const checkboxes = document.querySelectorAll(".menu-checkbox:checked");
    if (checkboxes.length === 0) {
      alert("Please select at least one menu to export!");
      return;
    }

    const selectedMenuIds = Array.from(checkboxes).map(
      (cb) => cb.dataset.menuId
    );
    const selectedMenus = [];

    for (const menuId of selectedMenuIds) {
      const menu = await getMenu(menuId);
      if (menu) selectedMenus.push(menu);
    }

    if (selectedMenus.length === 0) {
      alert("No valid menus found for export!");
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      menuCount: selectedMenus.length,
      menus: selectedMenus,
    };

    const defaultFilename = `selected_menus_${
      new Date().toISOString().split("T")[0]
    }`;
    showExportDialog(
      "selected",
      exportData,
      defaultFilename,
      `Selected menus (${selectedMenus.length} total)`
    );

    hideBulkExportDialog();
  } catch (error) {
    console.error("Error exporting selected menus:", error);
    alert("Error exporting selected menus. Please try again.");
  }
};

// Handle file import
window.handleImport = async function (event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  for (const file of files) {
    try {
      const text = await readFileAsText(file);
      const data = JSON.parse(text);

      // Check if it's a single menu or multiple menus
      if (data.menus && Array.isArray(data.menus)) {
        // Multiple menus format
        await importMultipleMenus(data.menus);
      } else if (data.id && data.type && data.date) {
        // Single menu format
        await importSingleMenu(data);
      } else {
        throw new Error("Invalid file format");
      }
    } catch (error) {
      console.error("Error importing file:", file.name, error);
      alert(`Error importing ${file.name}: ${error.message}`);
    }
  }

  // Clear the file input
  event.target.value = "";

  // Refresh the menu list
  listMenus();
};

// Import a single menu
async function importSingleMenu(menuData) {
  try {
    // Generate a new ID if there's a conflict
    let originalId = menuData.id;
    let newId = originalId;
    let counter = 1;

    while (await getMenu(newId)) {
      newId = `${originalId}_imported_${counter}`;
      counter++;
    }

    if (newId !== originalId) {
      menuData.id = newId;
      console.log(
        `Menu ID changed from ${originalId} to ${newId} to avoid conflict`
      );
    }

    await saveMenu(menuData);
    console.log(`Imported menu: ${menuData.date} - ${menuData.type}`);
  } catch (error) {
    throw new Error(`Failed to import menu: ${error.message}`);
  }
}

// Import multiple menus
async function importMultipleMenus(menusArray) {
  let importedCount = 0;
  let skippedCount = 0;

  for (const menuData of menusArray) {
    try {
      await importSingleMenu(menuData);
      importedCount++;
    } catch (error) {
      console.error("Error importing menu:", menuData, error);
      skippedCount++;
    }
  }

  alert(
    `Import complete!\nImported: ${importedCount} menus\nSkipped: ${skippedCount} menus`
  );
}

// Utility function to download JSON data as a file
function downloadJSON(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  // Check if File System Access API is supported
  if ("showSaveFilePicker" in window) {
    // Use the modern File System Access API
    downloadWithFileSystemAPI(blob, filename);
  } else {
    // Fallback to traditional download
    downloadWithTraditionalMethod(blob, filename);
  }
}

// Modern File System Access API download (Chrome 86+)
async function downloadWithFileSystemAPI(blob, filename) {
  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: "JSON files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    });

    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();

    console.log("File saved successfully with File System Access API");
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("User cancelled file save");
    } else {
      console.error("Error with File System Access API, falling back:", error);
      downloadWithTraditionalMethod(blob, filename);
    }
  }
}

// Traditional download method (all browsers)
function downloadWithTraditionalMethod(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Utility function to read file as text
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// ==================== ITEM BROWSER FUNCTIONALITY ====================

let allMenuItems = [];
let selectedItems = new Set();

// Load all items from all menus for browsing
window.loadItemBrowser = async function () {
  try {
    const menus = await getAllMenus();
    if (!menus || menus.length === 0) {
      alert("No menus available to browse!");
      return;
    }

    allMenuItems = [];

    // Collect all items from all menus
    menus.forEach((menu) => {
      ["appetizers", "entrees", "desserts"].forEach((section) => {
        if (menu.items[section]) {
          menu.items[section].forEach((item, index) => {
            allMenuItems.push({
              ...item,
              section: section,
              menuId: menu.id,
              menuTitle: `${menu.date} - ${menu.type}`,
              itemId: `${menu.id}_${section}_${index}`,
            });
          });
        }
      });
    });

    renderItemBrowser();
    document.getElementById("itemBrowser").style.display = "block";
  } catch (error) {
    console.error("Error loading item browser:", error);
    alert("Error loading items. Please try again.");
  }
};

// Render the item browser
function renderItemBrowser() {
  const content = document.getElementById("itemBrowserContent");

  // Group items by menu
  const menuGroups = {};
  allMenuItems.forEach((item) => {
    if (!menuGroups[item.menuId]) {
      menuGroups[item.menuId] = {
        title: item.menuTitle,
        items: [],
      };
    }
    menuGroups[item.menuId].items.push(item);
  });

  let html = "";
  Object.keys(menuGroups).forEach((menuId) => {
    const group = menuGroups[menuId];
    const itemCount = group.items.length;

    html += `
      <div class="menu-group">
        <div class="menu-group-header" onclick="toggleMenuGroup('${menuId}')">
          <span><strong>${group.title}</strong> (${itemCount} items)</span>
          <span class="collapse-icon">▼</span>
        </div>
        <div id="menu-group-${menuId}" class="menu-group-items">
          ${group.items
            .map(
              (item) => `
            <div class="item-card ${
              selectedItems.has(item.itemId) ? "selected" : ""
            }" onclick="toggleItemSelection('${item.itemId}')">
              <input type="checkbox" 
                     ${selectedItems.has(item.itemId) ? "checked" : ""} 
                     onchange="handleItemCheckbox('${
                       item.itemId
                     }', this.checked)"
                     onclick="event.stopPropagation()">
              <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                  ${
                    item.ingredients
                      ? item.ingredients
                      : "No ingredients listed"
                  }
                  ${item.description ? `<br><em>${item.description}</em>` : ""}
                </div>
              </div>
              <span class="item-section">${item.section.replace(
                "entrees",
                "entrées"
              )}</span>
              <span class="item-price">${item.price}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  });

  content.innerHTML = html;
  updateSelectedItemsSummary();
}

// Toggle menu group expansion
window.toggleMenuGroup = function (menuId) {
  const group = document.getElementById(`menu-group-${menuId}`);
  const header = group.previousElementSibling;
  const icon = header.querySelector(".collapse-icon");

  if (group.classList.contains("expanded")) {
    group.classList.remove("expanded");
    header.classList.add("collapsed");
  } else {
    group.classList.add("expanded");
    header.classList.remove("collapsed");
  }
};

// Toggle individual item selection
window.toggleItemSelection = function (itemId) {
  if (selectedItems.has(itemId)) {
    selectedItems.delete(itemId);
  } else {
    selectedItems.add(itemId);
  }

  updateItemVisualState(itemId);
  updateSelectedItemsSummary();
};

// Handle checkbox changes
window.handleItemCheckbox = function (itemId, checked) {
  if (checked) {
    selectedItems.add(itemId);
  } else {
    selectedItems.delete(itemId);
  }

  updateItemVisualState(itemId);
  updateSelectedItemsSummary();
};

// Update visual state of an item
function updateItemVisualState(itemId) {
  const itemCard = document.querySelector(
    `[onclick="toggleItemSelection('${itemId}')"]`
  );
  const checkbox = itemCard?.querySelector('input[type="checkbox"]');

  if (itemCard && checkbox) {
    if (selectedItems.has(itemId)) {
      itemCard.classList.add("selected");
      checkbox.checked = true;
    } else {
      itemCard.classList.remove("selected");
      checkbox.checked = false;
    }
  }
}

// Select/deselect all items
window.selectAllItems = function (selectAll) {
  if (selectAll) {
    allMenuItems.forEach((item) => selectedItems.add(item.itemId));
  } else {
    selectedItems.clear();
  }

  // Update all visual states
  allMenuItems.forEach((item) => updateItemVisualState(item.itemId));
  updateSelectedItemsSummary();
};

// Update the selected items summary
function updateSelectedItemsSummary() {
  const summaryDiv = document.getElementById("selectedItemsSummary");
  const countSpan = document.getElementById("selectedItemCount");
  const listDiv = document.getElementById("selectedItemsList");

  const selectedCount = selectedItems.size;
  countSpan.textContent = selectedCount;

  if (selectedCount > 0) {
    summaryDiv.style.display = "block";

    // Show first few selected items
    const selectedItemsArray = Array.from(selectedItems).slice(0, 5);
    const selectedItemNames = selectedItemsArray.map((itemId) => {
      const item = allMenuItems.find((item) => item.itemId === itemId);
      return item ? item.name : "Unknown";
    });

    let listText = selectedItemNames.join(", ");
    if (selectedCount > 5) {
      listText += ` + ${selectedCount - 5} more`;
    }

    listDiv.textContent = listText;
  } else {
    summaryDiv.style.display = "none";
  }
}

// Export selected items
window.exportSelectedItems = function () {
  if (selectedItems.size === 0) {
    alert("Please select at least one item to export!");
    return;
  }

  const selectedItemsData = Array.from(selectedItems)
    .map((itemId) => {
      return allMenuItems.find((item) => item.itemId === itemId);
    })
    .filter((item) => item); // Remove any undefined items

  const exportData = {
    exportDate: new Date().toISOString(),
    exportType: "selected_items",
    itemCount: selectedItemsData.length,
    items: selectedItemsData.map((item) => ({
      name: item.name,
      price: item.price,
      ingredients: item.ingredients,
      description: item.description,
      section: item.section,
      sourceMenu: {
        id: item.menuId,
        title: item.menuTitle,
      },
    })),
  };

  const defaultFilename = `selected_items_${
    new Date().toISOString().split("T")[0]
  }`;
  showExportDialog(
    "items",
    exportData,
    defaultFilename,
    `Selected items (${selectedItemsData.length} total)`
  );
};

// Toggle item browser visibility
window.toggleItemBrowser = function () {
  const browser = document.getElementById("itemBrowser");
  if (browser.style.display === "none") {
    loadItemBrowser();
  } else {
    browser.style.display = "none";
  }
};

// ==================== ITEM IMPORT FUNCTIONALITY ====================

// Global variables for item import
let currentItemImportData = null;

// Handle item import file selection
window.handleItemImport = async function (event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  try {
    const text = await readFileAsText(file);
    const data = JSON.parse(text);

    // Validate that it's an item export file
    if (
      !data.items ||
      !Array.isArray(data.items) ||
      data.exportType !== "selected_items"
    ) {
      throw new Error(
        'Invalid item file format. Please select a file exported from "Export Selected Items".'
      );
    }

    currentItemImportData = data;
    await showItemImportDialog();
  } catch (error) {
    console.error("Error loading item file:", error);
    alert(`Error loading item file: ${error.message}`);
  }

  // Clear the file input
  event.target.value = "";
};

// Show item import dialog
async function showItemImportDialog() {
  try {
    // Load available menus for selection
    const menus = await getAllMenus();
    const targetMenuSelect = document.getElementById("targetMenu");

    // Clear existing options
    targetMenuSelect.innerHTML = '<option value="">Choose a menu...</option>';

    if (!menus || menus.length === 0) {
      alert("No menus available! Please create a menu first.");
      return;
    }

    // Populate menu options
    // Sort menus by date (newest first)
    const sortedMenus = menus.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedMenus.forEach((menu) => {
      const option = document.createElement("option");
      option.value = menu.id;

      // Calculate total item count
      const itemCount =
        (menu.items.appetizers?.length || 0) +
        (menu.items.entrees?.length || 0) +
        (menu.items.desserts?.length || 0);

      option.textContent = `${menu.date} - ${menu.type} (${itemCount} items)`;
      targetMenuSelect.appendChild(option);
    });

    // Show preview of items to import
    const previewDiv = document.getElementById("itemImportPreview");
    const listDiv = document.getElementById("itemImportList");

    if (currentItemImportData && currentItemImportData.items) {
      const items = currentItemImportData.items;
      let listHTML = `<p><strong>${items.length} items found:</strong></p><ul style="margin: 0.5rem 0; padding-left: 1.5rem;">`;

      items.slice(0, 10).forEach((item) => {
        listHTML += `<li><strong>${item.name}</strong> (${item.price})${
          item.section ? ` - from ${item.section}` : ""
        }</li>`;
      });

      if (items.length > 10) {
        listHTML += `<li><em>... and ${items.length - 10} more items</em></li>`;
      }

      listHTML += "</ul>";
      listDiv.innerHTML = listHTML;
      previewDiv.style.display = "block";
    }

    // Show the dialog
    document.getElementById("itemImportDialog").style.display = "flex";
  } catch (error) {
    console.error("Error showing item import dialog:", error);
    alert("Error loading menus for import. Please try again.");
  }
}

// Close item import dialog
window.closeItemImportDialog = function () {
  document.getElementById("itemImportDialog").style.display = "none";
  currentItemImportData = null;
};

// Confirm item import
window.confirmItemImport = async function () {
  const targetMenuId = document.getElementById("targetMenu").value;
  const targetSection = document.getElementById("targetSection").value;
  const preventDuplicates =
    document.getElementById("preventDuplicates").checked;

  if (!targetMenuId) {
    alert("Please select a target menu!");
    return;
  }

  if (!currentItemImportData || !currentItemImportData.items) {
    alert("No items to import!");
    return;
  }

  try {
    // Load the target menu
    const menu = await getMenu(targetMenuId);
    if (!menu) {
      alert("Target menu not found!");
      return;
    }

    // Ensure the target section exists
    if (!menu.items[targetSection]) {
      menu.items[targetSection] = [];
    }

    // Prepare items to add
    let itemsToAdd = currentItemImportData.items.map((item) => ({
      name: item.name,
      price: item.price,
      ingredients: item.ingredients || "",
      description: item.description || "",
    }));

    let skippedCount = 0;

    // Handle duplicate prevention
    if (preventDuplicates) {
      const existingNames = new Set();

      // Collect existing item names from all sections
      ["appetizers", "entrees", "desserts"].forEach((section) => {
        if (menu.items[section]) {
          menu.items[section].forEach((item) => {
            existingNames.add(item.name.toLowerCase().trim());
          });
        }
      });

      // Filter out duplicates
      const originalCount = itemsToAdd.length;
      itemsToAdd = itemsToAdd.filter((item) => {
        const itemName = item.name.toLowerCase().trim();
        if (existingNames.has(itemName)) {
          skippedCount++;
          return false;
        }
        existingNames.add(itemName); // Add to set to prevent duplicates within import batch
        return true;
      });
    }

    // Add items to the target section
    menu.items[targetSection].push(...itemsToAdd);

    // Save the updated menu
    await saveMenu(menu);

    // Show success message
    const sectionName =
      targetSection === "entrees"
        ? "Entrées"
        : targetSection.charAt(0).toUpperCase() + targetSection.slice(1);

    let message = `✅ Successfully imported ${itemsToAdd.length} items to ${sectionName} in "${menu.date} - ${menu.type}"!`;

    if (skippedCount > 0) {
      message += `\n\n⚠️ Skipped ${skippedCount} duplicate items.`;
    }

    if (itemsToAdd.length === 0 && skippedCount > 0) {
      message = `ℹ️ No new items imported - all ${skippedCount} items already exist in the menu.`;
    }

    alert(message);

    // Close dialog and refresh menu list
    closeItemImportDialog();
    listMenus();
  } catch (error) {
    console.error("Error importing items:", error);
    alert("Error importing items. Please try again.");
  }
};

// Close dialog when clicking outside
document.addEventListener("click", function (event) {
  const dialog = document.getElementById("itemImportDialog");
  if (event.target === dialog) {
    closeItemImportDialog();
  }
});
