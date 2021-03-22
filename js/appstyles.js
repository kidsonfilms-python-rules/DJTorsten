const themeMap = {
    dark: "light",
    light: "dark",
  };
  
  const theme = localStorage.getItem('theme')
    || (tmp = Object.keys(themeMap)[0],
        localStorage.setItem('theme', tmp),
        tmp);
  const bodyClass = document.body.classList;
  bodyClass.add(theme);
  
  function toggleTheme() {
    const current = localStorage.getItem('theme');
    const next = themeMap[current];
  
    bodyClass.replace(current, next);
    localStorage.setItem('theme', next);
  }
  
  document.getElementById('themeButton').onclick = toggleTheme;

  function checkInternet(cb) {
    require('dns').lookup('google.com', function (err) {
        if (err && err.code == "ENOTFOUND") {
            cb(false);
        } else {
            cb(true);
        }
    })
  }
  window.addEventListener('offline', () => checkInternet((r) => {
    if (!r) {
      window.location.replace(`loading.html?redirect=${window.location.href.split('/').pop()}`)
    }
  }))
  checkInternet((r) => {
    if (!r) {
      window.location.replace(`loading.html?redirect=${window.location.href.split('/').pop()}`)
    }
  })