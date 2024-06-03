(function () {
  "use strict";

  const navLinks = document.querySelectorAll(
    ".touch-navbar .nav-link",
  );
  const navToggle = document.getElementById('nav-toggle');
  navLinks.forEach((toggler) => {
    toggler?.addEventListener('click', () => {
      navToggle.checked = navToggle.checked ? false : true;
    });
  });

})();
