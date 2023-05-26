/*
 * Name: Hanyang Yu
 * Date: May 10, 2023
 * Section: CSE 154 AF
 * TA: Donovan Kong && Sonia Saitawdekar
 * This is the JS to implement the UI for the pokedex and two Pokemon cards.
 * A Pokedex is an encyclopedia (or album) of different Pokemon species, representing each
 * Pokemon as a small "sprite" image. Player can choose from the 3 default pokemon and fight
 * with others. There is a game system provided. Once they defeat a new pokemon, they can use it.
 */
"use strict";

(function() {

  window.addEventListener("load", init);

  function init() {
    id('search-btn').addEventListener('click', searchBtnClicked);
    id('home-btn').addEventListener('click', homeBtnClicked);
    id('yip-btn').addEventListener('click', yipBtnClicked);
    id('new').querySelector('form').addEventListener('submit', newFormSubmitted);
    id('home').addEventListener('click', homeViewClicked);
    id('search-term').addEventListener('input', searchTermInput);
    loadYips();
  }

  async function searchBtnClicked() {
    try {
      setError(false);
      showView('home');
      const response = await fetch(`/yipper/yips?search=${id('search-term').value.trim()}`);
      if (!response.ok) throw new Error(response.statusText);
      const { ids } = await response.json();
      const cards = id('home').querySelectorAll('.card');
      for (const card of cards) {
        card.classList.toggle('hidden', !ids.includes(card.id));
      }
    } catch (err) {
      setError(true);
    }
  }

  function homeBtnClicked() {
    setError(false);
    showView('home');
    id('search-term').value = '';
    const cards = id('home').querySelectorAll('.card');
    for (const card of cards) {
      card.classList.remove('hidden');
    }
  }

  function yipBtnClicked() {
    setError(false);
    showView('new');
  }

  async function newFormSubmitted(event) {
    event.preventDefault();
    try {
      setError(false);
      const nameInput = qs('#new form').querySelector('#name');
      const yipInput = qs('#new form').querySelector('#yip');
      const response = await fetch('/yipper/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameInput.value, full: yipInput.value }),
      });
      if (!response.ok) throw new Error(response.statusText);
      const yip = await response.json();
      id('home').prepend(createYipCard(yip));
      nameInput.value = '';
      yipInput.value = '';
      setTimeout(() => showView('home'), 2000);
    } catch (err) {
      setError(true);
    }
  }

  async function homeViewClicked(event) {
    if (!event.target.classList.contains('individual')) return;
    try {
      setError(false);
      showView('user');
      id('user').innerHTML = '';
      const response = await fetch(`/yipper/user/${event.target.textContent}`);
      if (!response.ok) throw new Error(response.statusText);
      const { name, yips } = await response.json();
      const userArticle = document.createElement('article');
      userArticle.classList.add('single');
      const userHeader = document.createElement('h2');
      userHeader.textContent = `Yips shared by ${name}:`;
      userArticle.appendChild(userHeader);
      for (let i = 0; i < yips.length; i++) {
        const yipElement = document.createElement('p');
        yipElement.textContent = `Yip ${i + 1}: ${yips[i].yip} #${yips[i].hashtag}`;
        userArticle.appendChild(yipElement);
      }
      id('user').appendChild(userArticle);
    } catch (err) {
      setError(true);
    }
  }

  function searchTermInput() {
    id('search-btn').disabled = !id('search-term').value.trim();
  }

  async function loadYips() {
    try {
      setError(false);
      let response = await fetch('/yipper/yips');
      if (!response.ok) throw new Error(response.statusText);
      const { yips } = await response.json();
      id('home').innerHTML = '';
      for (const yip of yips) {
        id('home').appendChild(createYipCard(yip));
      }
    } catch (err) {
      setError(true);
    }
  }

  // Other helper functions go here
  // Such as showView, setError, createYipCard

  /**
   * This function creates a Yip card element based on a given Yip object.
   * @param {Object} yipInfo - the yip object that includes id, name, yip, hashtag, likes, and date
   * @returns {HTMLElement} a DOM element that represents a Yip card.
   */
  async function createYipCard(yipInfo) {
    console.log('card making');
    let card = document.createElement('article');
    card.id = yipInfo.id;
    card.classList.add('card');
    let userImage = document.createElement('img');
    userImage.src = `img/${yipInfo.name.toLowerCase().split(' ').join('-')}.png`;
    card.appendChild(userImage);
    let yipDiv = document.createElement('div');
    let individual = document.createElement('p');
    individual.classList.add('individual');
    individual.textContent = yipInfo.name;
    let yipElement = document.createElement('p');
    yipElement.textContent = `${yipInfo.yip} #${yipInfo.hashtag}`;
    yipDiv.appendChild(individual);
    yipDiv.appendChild(yipElement);
    card.appendChild(yipDiv);
    const metaDiv = document.createElement('div');
    metaDiv.classList.add('meta');
    const dateElement = document.createElement('p');
    dateElement.textContent = new Date(yipInfo.date).toLocaleString();
    const likesDiv = document.createElement('div');
    const heartImg = document.createElement('img');
    heartImg.src = 'img/heart.png';

    // Handle heart click
    heartImg.addEventListener('click', async () => {
      const response = await fetch('/yipper/likes', {
        method: 'POST',
        body: JSON.stringify(yipInfo),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const { likes: newLikes } = await response.json();
      likesElement.textContent = newLikes;
    });

    // Append likes info to card
    const likesElement = document.createElement('p');
    likesElement.textContent = yipInfo.likes;
    likesDiv.appendChild(heartImg);
    likesDiv.appendChild(likesElement);
    metaDiv.appendChild(dateElement);
    metaDiv.appendChild(likesDiv);
    card.appendChild(metaDiv);
    return card;
  }

  function setError(errorStatus) {
    if(errorStatus) {
      id('error').classList.remove('hidden');
    } else {
      id('error').classList.add('hidden');
    }
  }

  /**
   * Display the specified view and hide all other views.
   * @param {HTMLElement} view - The view to be displayed.
   */
  function showView(view) {
    id('home').classList.add('hidden');
    id('user').classList.add('hidden');
    id('new').classList.add('hidden');
    id(view).classList.remove('hidden');
  }

  /**
   * Returns the element with the specified id attribute.
   * @param {string} id string representing the id attribute of the element to be returned.
   * @returns {HTMLElement} The element with the specified id attribute.
   */
  function id(id) {
    return document.getElementById(id);
  }


  /**
   * Checks the response status and throws an error if it's not OK.
   * @param {Response} res - The fetch response object
   * @throws {Error} If the response status is not OK
   * @returns {Response} The original response object if the status is OK
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * A function that simplify calling document.querySelectorAll
   * @param {selectors} query: A query of selector
   * @returns {NodeList} An Element object representing the all elements in the document
   * that matches the specified set of CSS selectors, or null is returned if there are no matches.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * A function that simplify calling document.querySelector
   * @param {selectors} query: A query of selectors
   * @returns {Element} An Element object representing the first element in the
   * document that matches the specified set of CSS selectors, or null is returned
   * if there are no matches.
   */
  function qs(query) {
    return document.querySelector(query);
  }
})();