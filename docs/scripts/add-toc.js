/* eslint-disable no-inner-declarations */
/* eslint-disable require-jsdoc */
// 给 tutorials 文章新增目录功能
if (location.href.includes('tutorial') && typeof tocbot !== 'undefined') {

  // var link = document.createElement('link');
  // link.type = 'text/css';
  // link.rel = 'stylesheet';
  // link.href = 'styles/toc.css';
  // var head = document.getElementsByTagName('head')[0];
  // head.appendChild(link);

  const tocContainer = document.createElement('div');
  tocContainer.setAttribute('id', 'toc-container');
  const articleElement = document.getElementsByTagName('article')[0];
  articleElement.insertAdjacentElement('afterend', tocContainer);
  [...document.getElementsByTagName('h1')].forEach(
    (element, index) => (element.id = `h1-${index}`)
  );
  [...document.getElementsByTagName('h2')].forEach(
    (element, index) => (element.id = `h2-${index}`)
  );
  [...document.getElementsByTagName('h3')].forEach(
    (element, index) => (element.id = `h3-${index}`)
  );

  tocbot.init({
    // Where to render the table of contents.
    tocSelector: '#toc-container',
    // Where to grab the headings to build the table of contents.
    contentSelector: 'article',
    // Which headings to grab inside of the contentSelector element.
    headingSelector: 'h1, h2',
    // For headings inside relative or absolute positioned containers within content.
    hasInnerContainers: false
  });
  // 文章滚动时，目录自动滚动到 active 的 li 标签。
  function handleScroll() {
    const toc = document.querySelector('#toc-container');
    const active = document.querySelector('.is-active-li');
    // 向下滚动 active li 超出目录栏、向上滚动时 active li 超出目录栏，则滚动到 active li 位置
    if (
      active.getBoundingClientRect().bottom - 100 > toc.clientHeight ||
      active.getBoundingClientRect().top - 100 < 0
    ) {
      toc.scrollTo({ top: active.offsetTop, behavior: 'smooth' });
    }
  }
  function debounce(fn, wait) {
    var timeout = null;
    return function() {
      if (timeout !== null) clearTimeout(timeout);
      timeout = setTimeout(fn, wait);
    };
  }
  document.onscroll = debounce(handleScroll, 100);
}
