document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Announcement bar rotation ---------- */
  document.querySelectorAll('[data-autoplay]').forEach(function (bar) {
    var items = bar.querySelectorAll('.announcement-bar__item');
    if (items.length < 2) return;
    var index = 0;
    var speed = parseInt(bar.dataset.autoplay, 10) || 5000;
    setInterval(function () {
      items[index].style.display = 'none';
      index = (index + 1) % items.length;
      items[index].style.display = 'block';
    }, speed);
  });

  /* ---------- Mobile menu ---------- */
  var mobileToggle = document.querySelector('[data-mobile-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('is-open');
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  /* ---------- Search panel ---------- */
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      var isOpen = searchPanel.classList.toggle('is-open');
      searchPanel.setAttribute('aria-hidden', !isOpen);
      if (isOpen) {
        var input = searchPanel.querySelector('input[type="search"]');
        if (input) input.focus();
      }
    });
  }

  /* ---------- Cart drawer ---------- */
  var cartDrawer = document.getElementById('cart-drawer');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-toggle]')) {
      e.preventDefault();
      openCart();
    }
    if (e.target.closest('[data-cart-close]')) {
      e.preventDefault();
      closeCart();
    }
  });

  function refreshCartDrawer() {
    fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        var countEl = document.querySelector('[data-cart-count]');
        if (countEl) countEl.textContent = cart.item_count;
      });

    fetch('/?sections=cart-drawer')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var html = data['cart-drawer'];
        if (!html) return;
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var newContent = doc.getElementById('cart-drawer-content');
        var target = document.getElementById('cart-drawer-content');
        if (newContent && target) target.innerHTML = newContent.innerHTML;
      })
      .catch(function (err) { console.error('Cart drawer refresh failed', err); });
  }

  /* ---------- Add to cart (AJAX) ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[action^="/cart/add"]');
    if (!form) return;
    e.preventDefault();

    var formData = new FormData(form);
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    })
      .then(function (res) { return res.json(); })
      .then(function () {
        refreshCartDrawer();
        openCart();
      })
      .catch(function (err) {
        console.error('Add to cart failed', err);
      });
  });

  /* ---------- Cart quantity change / remove (event delegation) ---------- */
  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-cart-item]');
    if (!item) return;
    var line = item.dataset.line;
    var input = item.querySelector('[data-cart-qty-input]');

    if (e.target.closest('[data-cart-qty-increase]')) {
      input.value = parseInt(input.value, 10) + 1;
      updateCartLine(line, input.value);
    }
    if (e.target.closest('[data-cart-qty-decrease]')) {
      input.value = Math.max(0, parseInt(input.value, 10) - 1);
      updateCartLine(line, input.value);
    }
    if (e.target.closest('[data-cart-remove]')) {
      updateCartLine(line, 0);
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-cart-qty-input]')) {
      var item = e.target.closest('[data-cart-item]');
      updateCartLine(item.dataset.line, e.target.value);
    }
  });

  function updateCartLine(line, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity })
    })
      .then(function () { refreshCartDrawer(); })
      .catch(function (err) { console.error('Cart update failed', err); });
  }

  /* ---------- Product gallery thumbnails ---------- */
  document.querySelectorAll('[data-thumb]').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var mainImage = document.getElementById('ProductMainImage');
      if (mainImage) mainImage.src = thumb.dataset.imageUrl;
    });
  });

  /* ---------- Countdown banner ---------- */
  document.querySelectorAll('[data-countdown]').forEach(function (el) {
    var end = new Date(el.dataset.end).getTime();
    if (isNaN(end)) return;
    var daysEl = el.querySelector('[data-days]');
    var hoursEl = el.querySelector('[data-hours]');
    var minutesEl = el.querySelector('[data-minutes]');
    var secondsEl = el.querySelector('[data-seconds]');

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var diff = end - Date.now();
      if (diff <= 0) {
        daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = '00';
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var minutes = Math.floor((diff % 3600000) / 60000);
      var seconds = Math.floor((diff % 60000) / 1000);
      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.faq-item').classList.toggle('is-open');
    });
  });

  /* ---------- Style finder quiz ---------- */
  document.querySelectorAll('[data-style-finder]').forEach(function (quiz) {
    var steps = quiz.querySelectorAll('.style-finder__step');
    var results = quiz.querySelectorAll('.style-finder__result');
    var currentStep = 0;
    var answers = {};

    function showStep(index) {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });
    }

    quiz.querySelectorAll('.style-finder__option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var step = opt.closest('.style-finder__step');
        step.querySelectorAll('.style-finder__option').forEach(function (o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');
        answers[step.dataset.step] = opt.dataset.value;

        currentStep++;
        if (currentStep < steps.length) {
          showStep(currentStep);
        } else {
          var resultKey = Object.values(answers).join('-');
          var matched = quiz.querySelector('.style-finder__result[data-result="' + resultKey + '"]') || quiz.querySelector('.style-finder__result[data-result="default"]');
          results.forEach(function (r) { r.classList.remove('is-active'); });
          if (matched) matched.classList.add('is-active');
          quiz.querySelector('.style-finder__quiz').style.display = 'none';
          quiz.querySelector('.style-finder__results-wrap').style.display = 'block';
        }
      });
    });

    if (steps.length) showStep(0);
  });

  /* ---------- Variant swatches ---------- */
  var variantsJsonEl = document.getElementById('ProductVariantsJson');
  if (variantsJsonEl) {
    var variants = JSON.parse(variantsJsonEl.textContent);
    var optionGroups = document.querySelectorAll('.product-form__swatches');
    var variantSelect = document.querySelector('[data-variant-select]');
    var mainImage = document.getElementById('ProductMainImage');
    var priceWrap = document.getElementById('ProductPrice');
    var addToCartBtn = document.getElementById('AddToCartButton');
    var addToCartText = document.getElementById('AddToCartText');

    function formatMoney(cents) {
      var format = window.themeMoneyFormat || '${{amount}}';
      var amount = (cents / 100).toFixed(2);
      return format.replace(/\{\{\s*amount\s*\}\}/, amount);
    }

    function currentSelectedOptions() {
      var options = [];
      optionGroups.forEach(function (group) {
        var index = parseInt(group.dataset.optionIndex, 10);
        var selected = group.querySelector('.product-form__swatch.is-selected');
        options[index] = selected ? selected.dataset.optionValue : null;
      });
      return options;
    }

    function findMatchingVariant(options) {
      return variants.find(function (variant) {
        return options.every(function (value, i) {
          return value == null || variant.options[i] === value;
        });
      });
    }

    function applyVariant(variant) {
      if (!variant) return;
      if (variantSelect) variantSelect.value = variant.id;
      if (mainImage && variant.featured_image) mainImage.src = variant.featured_image.src;
      if (priceWrap) {
        var priceHtml = variant.compare_at_price && variant.compare_at_price > variant.price
          ? '<div class="price price--sale"><span class="price__sale">' + formatMoney(variant.price) + '</span><span class="price__compare">' + formatMoney(variant.compare_at_price) + '</span></div>'
          : '<div class="price"><span>' + formatMoney(variant.price) + '</span></div>';
        priceWrap.innerHTML = priceHtml;
      }
      if (addToCartBtn) {
        addToCartBtn.disabled = !variant.available;
        if (addToCartText) addToCartText.textContent = variant.available ? 'Add to Cart' : 'Sold Out';
      }
    }

    optionGroups.forEach(function (group) {
      group.querySelectorAll('.product-form__swatch').forEach(function (btn) {
        btn.addEventListener('click', function () {
          group.querySelectorAll('.product-form__swatch').forEach(function (b) { b.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          applyVariant(findMatchingVariant(currentSelectedOptions()));
        });
      });
    });
  }

});
