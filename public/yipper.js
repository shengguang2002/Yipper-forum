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

  /**
   * Asynchronously handles the click event for the search button.
   * Fetches Yips (posts) that match the entered search term and updates the view.
   * Catches and handles any errors that occur during the fetch.
   */
  async function searchBtnClicked() {
    try {
      setError(false);
      showView('home');
      let response = await fetch(`/yipper/yips?search=${id('search-term').value.trim()}`);
      await statusCheck(response);
      let rows = await response.json();
      let ids = rows.map(row => row.id);
      let cards = id('home').querySelectorAll('.card');
      for (let card of cards) {
        if (!ids.includes(parseInt(card.id))) {
          card.classList.add('hidden');
        } else {
          card.classList.remove('hidden');
        }
      }
    } catch (err) {
      setError(true);
    }
  }

  /**
   * Handles the click event for the home button.
   * Clears the search term and makes all Yip cards visible.
   */
  function homeBtnClicked() {
    setError(false);
    showView('home');
    id('search-term').value = '';
    let cards = id('home').querySelectorAll('.card');
    for (let card of cards) {
      card.classList.remove('hidden');
    }
  }

  /**
   * Handles the click event for the Yip button.
   * Shows the new Yip form.
   */
  function yipBtnClicked() {
    setError(false);
    showView('new');
  }

  /**
   * Asynchronously handles the submission event for the new Yip form.
   * Sends a POST request with the new Yip data and updates the view.
   * Catches and handles any errors that occur during the fetch.
   */
  async function newFormSubmitted(event) {
    event.preventDefault();
    try {
      setError(false);
      let nameInput = qs('#new form').querySelector('#name').value;
      let yipInput = qs('#new form').querySelector('#yip').value;
      let newYip = new FormData();
      newYip.append("name", nameInput);
      newYip.append("full", yipInput);
      let response = await fetch('/yipper/new', {method: 'POST', body: newYip});
      await statusCheck(response);
      let yip = await response.json();
      console.log(yip);
      let child = await createYipCard(yip);
      id('home').prepend(child);
      qs('#new form').querySelector('#name').value = '';
      qs('#new form').querySelector('#yip').value = '';
      setTimeout(() => showView('home'), 2000);
    } catch (err) {
      setError(true);
    }
  }

  /**
   * Asynchronously handles the click event in the home view.
   * Fetches the clicked user's Yips and updates the view.
   * Catches and handles any errors that occur during the fetch.
   */
  async function homeViewClicked(event) {
    if (!event.target.classList.contains('individual')) return;
    try {
      setError(false);
      showView('user');
      id('user').innerHTML = '';
      let response = await fetch(`/yipper/user/${event.target.textContent}`);
      await statusCheck(response);
      let rows = await response.json();
      let userArticle = document.createElement('article');
      userArticle.classList.add('single');
      let userHeader = document.createElement('h2');
      userHeader.textContent = `Yips shared by ${rows[0].name}:`;
      userArticle.appendChild(userHeader);
      for (let i = 0; i < rows.length; i++) {
        let yipElement = document.createElement('p');
        yipElement.textContent = `Yip ${i + 1}: ${rows[i].yip} #${rows[i].hashtag}`;
        userArticle.appendChild(yipElement);
      }
      id('user').appendChild(userArticle);
    } catch (err) {
      setError(true);
    }
  }

  /**
   * Handles the input event for the search term input field.
   * Enables or disables the search button depending on whether the input field is empty.
   */
  function searchTermInput() {
    id('search-btn').disabled = !id('search-term').value.trim();
  }

  /**
   * Asynchronously loads all Yips from the server.
   * Fetches all Yips and populates the home view with Yip cards.
   * Catches and handles any errors that occur during the fetch.
   */
  async function loadYips() {
    try {
      setError(false);
      showView('home');
      id('home').innerHTML = '';
      let response = await fetch('/yipper/yips');
      await statusCheck(response);
      let yips = await response.json();
      console.log(yips);
      for (let i = 0; i < yips.length; i++) {
        let yip = yips[i];
        let child = await createYipCard(yip);
        id('home').appendChild(child);
      }
    } catch (err) {
      setError(true);
    }
  }

  /**
   * Asynchronously creates a Yip card element from a given Yip object.
   * @param {Object} yipInfo - The yip object that includes id, name, yip, hashtag, likes,
   * and date.
   * @returns {HTMLElement} - A DOM element representing a Yip card.
   */
  async function createYipCard(yipInfo) {
    let card = document.createElement('article');
    card.classList.add('card');
    card.id = yipInfo.id;
    let userImage = document.createElement('img');
    userImage.src = `img/${yipInfo.name.toLowerCase().split(' ').join('-')}.png`;
    card.appendChild(userImage);
    let yipDiv = addYipDiv(yipInfo);
    card.appendChild(yipDiv);
    let metaDiv = document.createElement('div');
    metaDiv.classList.add('meta');
    let dateElement = document.createElement('p');
    dateElement.textContent = new Date(yipInfo.date).toLocaleString();
    let likesDiv = document.createElement('div');
    let heartImg = document.createElement('img');
    heartImg.src = 'img/heart.png';
    let likesElement = document.createElement('p');
    likesElement.textContent = yipInfo.likes;
    likesDiv.appendChild(heartImg);
    likesDiv.appendChild(likesElement);
    metaDiv.appendChild(dateElement);
    metaDiv.appendChild(likesDiv);
    card.appendChild(metaDiv);
    heartImg.addEventListener('click', async () => {
      let likedYip = new FormData();
      likedYip.append("id", card.id);
      let response = await fetch('/yipper/likes', {method: 'POST', body: likedYip});
      await statusCheck(response);
      let text = await response.text();
      likesElement.textContent = text;
    });
    return card;
  }

  /**
   * Adds a div with the Yip's name and content to the Yip card.
   * @param {Object} yipInfo - The Yip object that includes the Yip's name and content.
   * @returns {HTMLElement} - A div element containing the Yip's name and content.
   */
  function addYipDiv(yipInfo) {
    let yipDiv = document.createElement('div');
    let individual = document.createElement('p');
    individual.classList.add('individual');
    individual.textContent = yipInfo.name;
    let yipElement = document.createElement('p');
    yipElement.textContent = `${yipInfo.yip} #${yipInfo.hashtag}`;
    yipDiv.appendChild(individual);
    yipDiv.appendChild(yipElement);
    return yipDiv;
  }

  /**
   * Updates the view based on the error status.
   * @param {boolean} errorStatus - A boolean value indicating the error status.
   */
  function setError(errorStatus) {
    if(errorStatus) {
      id('home').classList.add('hidden');
      id('user').classList.add('hidden');
      id('new').classList.add('hidden');
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