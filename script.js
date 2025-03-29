const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpblR5cGUiOiIxIiwiQ3VzdG9tZXJJRCI6IjU1NzI0IiwiRmlyc3ROYW1lIjoiRGVtbyIsIkxhc3ROYW1lIjoiSHlwZXIiLCJFbWFpbCI6ImRlbW9AaHlwZXIuY29tIiwiQ3VzdG9tZXJUeXBlSUQiOiIzMiIsIklzUmVzZWxsZXIiOiIwIiwiSXNBUEkiOiIxIiwiUmVmZXJhbmNlSUQiOiIiLCJSZWdpc3RlckRhdGUiOiIzLzI1LzIwMjUgMTowMDo0OCBQTSIsImV4cCI6MjA1NDE3MDQwOCwiaXNzIjoiaHR0cHM6Ly9oeXBlcnRla25vbG9qaS5jb20iLCJhdWQiOiJodHRwczovL2h5cGVydGVrbm9sb2ppLmNvbSJ9.jAFIfu0uSMQdRlb3u2Re0GpC6IvqwofLKbyv6s8yB3k";
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("card-container");
  const categoryContainer = document.getElementById("category-container");

  const cartItemsContainer = document.getElementById("cart-items");
  const searchInput = document.getElementById("search-input"); 
  const categoryHeader = document.getElementById("category-header"); 
  const cartPanel = document.getElementById("cart-panel");
  const categoryMenu = document.getElementById("category-container");
  const toggleCategory = document.getElementById("toggle-category");
  const openCart = document.getElementById("open-cart");
  const closeCart = document.getElementById("close-cart");

  // Sepeti aç
  openCart.addEventListener("click", () => {
    cartPanel.classList.add("open");
  });

  //Sepeti kapa
  closeCart.addEventListener("click", () => {
    cartPanel.classList.remove("open");
  });

  let categoryId = 0;

  const payButton = document.querySelector("#btn-pay");
  const cart = [];
  let products = [];

  await fetchDatas();
  async function fetchDatas() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        APICALL(`Products/List?productCategoryID=0`, "POST"),
        APICALL(`Categories`, "GET")
      ]);

      products = productsRes?.data || [];
      renderProducts(products);
      renderCategories(categoriesRes?.data || []);
    } catch (err) {
      console.error("Verileri yüklenirken hata oluştu:", err);
    }
  }

  async function APICALL(endpoint, method, body = {}) {
    try {
      const response = await fetch(`https://api.hyperteknoloji.com.tr/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: method === "POST" ? JSON.stringify(body) : null,
      });

      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      return response.json();
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err);
      return null;
    }
  }
  async function fetchProducts() {
    try {
      const response = await fetch(
        `https://api.hyperteknoloji.com.tr/Products/List?productCategoryID=${categoryId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      const { data } = await response.json();
      products = data; 
      renderProducts(products); 
    } catch (error) {
      console.error("Veriler alınırken hata oluştu:", error);
    }
  }

//TL biçimi görünüm
  function formatPrice(price) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  }

  // Ürünleri ekrana ekleyen func
  function renderProducts(filteredProducts) {
    container.innerHTML = ""; 
    if (filteredProducts.length === 0) {
      container.innerHTML = `
          <div class="p-4 text-center text-gray-500 text-lg font-semibold">
              Ürün bulunamadı.
          </div>
      `;
      return;
    }
    filteredProducts.forEach((item) => {
      const card = document.createElement("div");
      card.className =
        "p-4 hover:scale-105 shadow h-min hover:shadow-lg transition-all duration-300 flex items-center flex-col";
      card.innerHTML = `
                      <img src="${
                        item.productData.productMainImage
                      }" width="300" height="300" class="mb-2 transition bg-red-200"/>
                      <h2 class="text-lg font-semibold text-gray-700 mb-2 truncate w-full overflow-hidden whitespace-nowrap">${
                        item.productName
                      }</h2>
                      <p class="text-gray-600 text-left w-full">${formatPrice(
                        item.salePrice
                      )}</p>
                      <div class="w-full flex items-center justify-between mt-2 ">
                          <button ${
                            item.totalStock > 0 ? "" : "disabled"
                          } id="add-to-cart-${
        item.productID
      }" class="whitespace-nowrap disabled:bg-red-800 text-xs bg-[#77B254] text-white py-1 px-3 rounded-lg hover:bg-[#5B913B] transition duration-300">
                              ${item.totalStock > 0 ? "Sepete Ekle" : "Tükendi"}
                          </button>
                           <a href="${
                             item.productSlug
                           }" class="flex text-xs items-center hover:scale-105 text-gray-900 rounded-lg hover:text-blue-500 transition duration-300">
                              Görüntüle
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M9 18l6-6-6-6"/>
                              </svg>
                          </a>
                      </div>
                  `;

      container.appendChild(card);

      // Sepete ekle
      const addToCartButton = document.getElementById(
        `add-to-cart-${item.productID}`
      );

      addToCartButton.addEventListener("click", () => {
        cart.push(item);

        cartPanel.classList.add("open");

        Swal.fire({
          title: "Sepete Eklendi!",
          text: `${item.productName} başarıyla sepete eklendi.`,
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
        });

        updateBasket();
        console.log(`${item.productName} sepete eklendi!`);
      });
    });
  }
  function renderCategories(filteredCategories) {
    categoryContainer.innerHTML = "";

    const allCategoriesButton = document.createElement("button");
    const closeMenuButton = document.createElement("div");
    closeMenuButton.addEventListener("click", () => {
      categoryMenu.classList.toggle("-translate-x-full");
    });
    closeMenuButton.className =
      " w-full text-gray-900 text-white flex justify-end  p-2 px-3 rounded md:hidden";

    closeMenuButton.innerHTML = `
    <button class="">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="#222422" d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4"/>
    </svg>
    </button>
  `;

    allCategoriesButton.className =
      "p-2 shadow hover:shadow-lg w-full text-white  transition-all duration-300 flex items-center justify-center bg-[#229799]";
    allCategoriesButton.innerText = "Tüm Kategoriler";
    allCategoriesButton.addEventListener("click", () => {
      categoryId = 0;

      fetchProducts();
      categoryHeader.innerText = "";
    });
    categoryContainer.appendChild(closeMenuButton);

    categoryContainer.appendChild(allCategoriesButton);

    filteredCategories.forEach((item) => {
      const card = document.createElement("button");

      card.className = `p-2 shadow hover:shadow-lg w-full transition-all duration-300 flex items-center flex-col`;

      card.innerHTML = `
        <div key="${item.productCategoryID}" class="w-full p-0.5 flex items-center space-x-1">
          <img src="${item.categoryDetail.categoryMainImage}" width="30"/>
          <p class="text-sm text-left">${item.categoryName}</p>
        </div>
      `;
      card.addEventListener("click", () => {
        categoryId = item.productCategoryID;
        categoryHeader.innerText = item.categoryName;
        fetchProducts();
        categoryMenu.classList.toggle("-translate-x-full");
      });

      categoryContainer.appendChild(card);
    });
  }

  // search
  function filterProducts() {
    const searchText = searchInput.value.toLowerCase(); 
    const filtered = products.filter((item) =>
      item.productName.toLowerCase().includes(searchText)
    );
    renderProducts(filtered);
  }

  // search çubuğu event listener
  searchInput.addEventListener("input", filterProducts);

  payButton.addEventListener("click", () => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Ödemeyi onaylıyor ve sepeti boşaltıyorsunuz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Evet, onaylıyorum!",
      cancelButtonText: "İptal",
    }).then((result) => {
      if (result.isConfirmed) {
        cart.length = 0; 
        updateBasket();
        Swal.fire(
          "Onaylandı!",
          "Ödeme işleminiz başarıyla tamamlandı.",
          "success"
        );
      }
    });
  });
  toggleCategory.addEventListener("click", () => {
    categoryMenu.classList.toggle("-translate-x-full");
  });
  // sepeti güncelle
  function updateBasket() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        "<p class='text-gray-500 text-sm'>Sepetiniz boş.</p>";
    } else {
      let totalAmount = 0;

      cart.forEach((item) => {
        const cartItem = document.createElement("div");
        cartItem.className =
          "flex items-center justify-between p-2 gap-2 border-b";
        cartItem.innerHTML = `
                    <img width="50" src="${item.productData.productMainImage}"/>
                    <p class="text-gray-700 text-sm">${item.productName}</p>
                    <p class="text-gray-500 text-xs">${formatPrice(
                      item.salePrice
                    )}</p>
                    <button class="remove-from-cart text-red-500 text-xs hover:text-red-700">Çıkar</button>
                `;
        cartItemsContainer.appendChild(cartItem);

        const removeButton = cartItem.querySelector(".remove-from-cart");
        removeButton.addEventListener("click", () => {
          cart.splice(cart.indexOf(item), 1);
          updateBasket();
          console.log(`${item.productName} sepetten çıkarıldı!`);
        });

        totalAmount += parseFloat(item.salePrice);
      });

      const totalDisplay = document.createElement("div");
      totalDisplay.className =
        "flex justify-between p-2 mt-4 text-xl font-semibold";
      totalDisplay.innerHTML = `
                <span>Toplam:</span>
                <span>${formatPrice(totalAmount)}</span>
            `;
      cartItemsContainer.appendChild(totalDisplay);
    }
  }
});
