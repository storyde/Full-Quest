(function() {
  var game;
  var ui;
  var currentTheme = 'light';

  var DateOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  // Character profiles for the chat interface
  var characters = {
    'narrator': { name: 'Narrator', avatar: '✦', class: 'narration' },
    'guide': { name: 'Guide', avatar: 'G', class: 'guide' },
    'companion': { name: 'Companion', avatar: 'C', class: 'companion' },
    'stranger': { name: 'Stranger', avatar: 'S', class: 'stranger' },
    'user': { name: 'You', avatar: 'Y', class: 'user' }
  };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // Initialize the interface
    initializeInterface();
    
    // Override the original content display
    ui.displayContent = displayChatContent;
    ui.displayChoices = displayChatChoices;
    
    // Load saved theme
    loadTheme();
  };

  function initializeInterface() {
    // Initialize sidebar toggles
    document.getElementById('progress-toggle').addEventListener('click', toggleProgressSidebar);
    document.getElementById('context-toggle').addEventListener('click', toggleContextSidebar);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Initialize sidebar overlay
    var overlay = document.getElementById('sidebar-overlay');
    overlay.addEventListener('click', closeSidebars);

    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Initialize keyboard navigation
    initializeKeyboardNavigation();
    
    // Handle initial responsive state
    handleResize();
  }

  function initializeKeyboardNavigation() {
    // Add keyboard support for header buttons
    var headerButtons = document.querySelectorAll('.header-btn');
    headerButtons.forEach(function(button) {
      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });

    // Add escape key to close sidebars
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeSidebars();
      }
    });
  }

  function handleResize() {
    var isMobile = window.innerWidth <= 768;
    var progressSidebar = document.getElementById('progress-sidebar');
    var contextSidebar = document.getElementById('context-sidebar');
    
    if (isMobile) {
      // On mobile, sidebars are hidden by default
      progressSidebar.classList.remove('active');
      contextSidebar.classList.remove('active');
      closeSidebars();
    } else {
      // On desktop, show sidebars by default
      progressSidebar.classList.remove('hidden');
      contextSidebar.classList.remove('hidden');
      closeSidebars();
    }
  }

  function toggleProgressSidebar() {
    var sidebar = document.getElementById('progress-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      var isActive = sidebar.classList.contains('active');
      closeSidebars(); // Close any open sidebars first
      
      if (!isActive) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
      }
    } else {
      sidebar.classList.toggle('hidden');
    }
  }

  function toggleContextSidebar() {
    var sidebar = document.getElementById('context-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      var isActive = sidebar.classList.contains('active');
      closeSidebars(); // Close any open sidebars first
      
      if (!isActive) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
      }
    } else {
      sidebar.classList.toggle('hidden');
    }
  }

  function closeSidebars() {
    var progressSidebar = document.getElementById('progress-sidebar');
    var contextSidebar = document.getElementById('context-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    
    progressSidebar.classList.remove('active');
    contextSidebar.classList.remove('active');
    overlay.classList.remove('active');
  }

  function toggleTheme() {
    var body = document.body;
    var themeIcon = document.querySelector('#theme-toggle span');
    
    if (body.classList.contains('theme-light')) {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      themeIcon.setAttribute('uk-icon', 'icon: moon; ratio: 1.2');
      currentTheme = 'dark';
    } else {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      themeIcon.setAttribute('uk-icon', 'icon: sun; ratio: 1.2');
      currentTheme = 'light';
    }
    
    // Save theme preference
    localStorage.setItem('fullquest-theme', currentTheme);
  }

  function loadTheme() {
    var savedTheme = localStorage.getItem('fullquest-theme') || 'light';
    var body = document.body;
    var themeIcon = document.querySelector('#theme-toggle span');
    
    if (savedTheme === 'dark') {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      themeIcon.setAttribute('uk-icon', 'icon: moon; ratio: 1.2');
      currentTheme = 'dark';
    } else {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      themeIcon.setAttribute('uk-icon', 'icon: sun; ratio: 1.2');
      currentTheme = 'light';
    }
  }

  function displayChatContent(content) {
    var chatContainer = document.getElementById('content');
    
    // Parse content and determine message type
    var messageData = parseContentForChat(content);
    
    // Add typing indicator for non-user messages
    if (messageData.character !== 'user') {
      showTypingIndicator(messageData.character);
      
      // Simulate realistic typing delay
      var typingDelay = Math.min(messageData.text.length * 30, 2000) + Math.random() * 500;
      setTimeout(function() {
        hideTypingIndicator();
        addChatMessage(messageData);
      }, typingDelay);
    } else {
      addChatMessage(messageData);
    }
  }

  function parseContentForChat(content) {
    var text = typeof content === 'string' ? content : content.text || '';
    
    // Determine character based on content patterns
    var character = 'narrator';
    if (text.includes('"') || text.includes('says:') || text.includes('whispers:')) {
      character = 'guide'; // Default for dialogue
    }
    
    // Clean up the text
    text = text.replace(/^[#\s]+/, '').trim();
    
    return {
      character: character,
      text: text,
      timestamp: new Date()
    };
  }

  function addChatMessage(messageData) {
    var chatContainer = document.getElementById('content');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message-bubble ' + messageData.character;
    
    var characterInfo = characters[messageData.character] || characters['narrator'];
    
    var html = '';
    
    // Add profile picture for character messages (not for narration)
    if (messageData.character !== 'narrator') {
      html += '<div class="profile-pic ' + characterInfo.class + '">' + characterInfo.avatar + '</div>';
    }
    
    // Add message content
    html += '<div class="message-content">';
    if (messageData.character !== 'narrator' && messageData.character !== 'user') {
      html += '<span class="character-name">' + characterInfo.name + '</span>';
    }
    
    html += messageData.text;
    html += '</div>';
    
    messageDiv.innerHTML = html;
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom with smooth animation
    var chatScrollContainer = document.getElementById('chat-container');
    chatScrollContainer.scrollTo({
      top: chatScrollContainer.scrollHeight,
      behavior: 'smooth'
    });
    
    // Update progress and context
    updateProgress(messageData);
    updateContext(messageData);
  }

  function showTypingIndicator(character) {
    var chatContainer = document.getElementById('content');
    var characterInfo = characters[character] || characters['narrator'];
    
    var typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    var html = '<div class="profile-pic ' + characterInfo.class + '">' + characterInfo.avatar + '</div>';
    html += '<div class="typing-dots">';
    html += '<div class="typing-dot"></div>';
    html += '<div class="typing-dot"></div>';
    html += '<div class="typing-dot"></div>';
    html += '</div>';
    
    typingDiv.innerHTML = html;
    chatContainer.appendChild(typingDiv);
    
    // Scroll to bottom
    var chatScrollContainer = document.getElementById('chat-container');
    chatScrollContainer.scrollTo({
      top: chatScrollContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  function hideTypingIndicator() {
    var typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  function displayChatChoices(choices) {
    var choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = '';
    
    if (!choices || choices.length === 0) {
      choicesContainer.style.display = 'none';
      return;
    }
    
    choicesContainer.style.display = 'block';
    
    choices.forEach(function(choice, index) {
      var button = document.createElement('button');
      button.className = 'choice-button';
      button.setAttribute('tabindex', '0');
      
      if (choice.canChoose === false) {
        button.className += ' unavailable';
        button.disabled = true;
      }
      
      var choiceText = choice.title || choice.text || 'Continue';
      button.innerHTML = '<span>' + choiceText + '</span>';
      
      if (choice.canChoose !== false) {
        button.addEventListener('click', function() {
          handleChoiceSelection(choice, choiceText);
        });
        
        // Add keyboard support
        button.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChoiceSelection(choice, choiceText);
          }
        });
      }
      
      choicesContainer.appendChild(button);
    });
    
    // Focus first available choice for accessibility
    var firstChoice = choicesContainer.querySelector('.choice-button:not(.unavailable)');
    if (firstChoice) {
      setTimeout(function() {
        firstChoice.focus();
      }, 100);
    }
  }

  function handleChoiceSelection(choice, choiceText) {
    // Add user message to chat
    addChatMessage({
      character: 'user',
      text: choiceText,
      timestamp: new Date()
    });
    
    // Clear choices with animation
    var choicesContainer = document.getElementById('choices-container');
    choicesContainer.style.opacity = '0';
    
    setTimeout(function() {
      choicesContainer.innerHTML = '';
      choicesContainer.style.display = 'none';
      choicesContainer.style.opacity = '1';
    }, 200);
    
    // Execute choice
    if (choice.id) {
      ui.choose(choice.id);
    } else if (typeof choice.choose === 'function') {
      choice.choose();
    }
  }

  function updateProgress(messageData) {
    var progressItems = document.querySelectorAll('.progress-item');
    
    // Enhanced progress logic
    var progressTriggers = [
      { keywords: ['adventure', 'quest', 'begin'], index: 0 },
      { keywords: ['meet', 'encounter', 'greet'], index: 1 },
      { keywords: ['choice', 'decide', 'choose'], index: 2 },
      { keywords: ['secret', 'discover', 'find'], index: 3 },
      { keywords: ['final', 'end', 'complete'], index: 4 }
    ];
    
    var text = messageData.text.toLowerCase();
    progressTriggers.forEach(function(trigger) {
      if (trigger.keywords.some(keyword => text.includes(keyword))) {
        markProgressComplete(trigger.index);
      }
    });
  }

  function markProgressComplete(index) {
    var progressItems = document.querySelectorAll('.progress-item');
    if (progressItems[index] && !progressItems[index].classList.contains('completed')) {
      progressItems[index].classList.add('completed');
      
      var icon = progressItems[index].querySelector('.progress-icon');
      if (icon) {
        icon.setAttribute('uk-icon', 'icon: check');
      }
    }
  }

  function updateContext(messageData) {
    // Update location based on message content
    var locationInfo = document.querySelector('.location-info');
    if (locationInfo && messageData.text.includes('forest')) {
      locationInfo.querySelector('h5').textContent = 'Dark Forest';
      locationInfo.querySelector('p').textContent = 'A mysterious woodland where shadows dance between ancient trees.';
    }
    
    // Update recent events
    var eventsList = document.querySelector('.events-list');
    if (eventsList) {
      var newEvent = document.createElement('div');
      newEvent.className = 'event-item';
      newEvent.innerHTML = '<span uk-icon="icon: history" class="event-icon"></span><span class="event-text">' + 
                           messageData.text.substring(0, 40) + (messageData.text.length > 40 ? '...' : '') + '</span>';
      
      eventsList.insertBefore(newEvent, eventsList.firstChild);
      
      // Keep only the last 3 events
      var events = eventsList.querySelectorAll('.event-item');
      if (events.length > 3) {
        eventsList.removeChild(events[events.length - 1]);
      }
    }
  }

  // Enhanced save/load system
  var TITLE = "Full Quest" + '_' + "storyde";

  window.saveSlot = function(slot) {
    var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
    localStorage[TITLE+'_save_' + slot] = saveString;
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    var date = new Date(Date.now());
    date = scene + '\n(' + date.toLocaleString(undefined, DateOptions) + ')';
    localStorage[TITLE+'_save_timestamp_' + slot] = date;
    window.populateSaveSlots(8, 2);
  };

  window.autosave = function() {
    var oldData = localStorage[TITLE+'_save_' + 'a0'];
    if (oldData) {
      localStorage[TITLE+'_save_'+'a1'] = oldData;
      localStorage[TITLE+'_save_timestamp_'+'a1'] = localStorage[TITLE+'_save_timestamp_'+'a0'];
    }
    var slot = 'a0';
    var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
    localStorage[TITLE+'_save_' + slot] = saveString;
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    var date = new Date(Date.now());
    date = scene + '\n(' + date.toLocaleString(undefined, DateOptions) + ')';
    localStorage[TITLE+'_save_timestamp_' + slot] = date;
    window.populateSaveSlots(8, 2);
  };

  window.loadSlot = function(slot) {
    if (localStorage[TITLE+'_save_' + slot]) {
      var saveString = localStorage[TITLE+'_save_' + slot];
      window.dendryUI.dendryEngine.setState(JSON.parse(saveString));
      window.hideSaveSlots();
    }
  };

  window.deleteSlot = function(slot) {
    if (localStorage[TITLE+'_save_' + slot]) {
      localStorage[TITLE+'_save_' + slot] = '';
      localStorage[TITLE+'_save_timestamp_' + slot] = '';
      window.populateSaveSlots(8, 2);
    }
  };

  window.populateSaveSlots = function(max_slots, max_auto_slots) {
    function createLoadListener(i) {
      return function(evt) {
        window.loadSlot(i);
      };
    }
    function createSaveListener(i) {
      return function(evt) {
        window.saveSlot(i);
      };
    }
    function createDeleteListener(i) {
      return function(evt) {
        window.deleteSlot(i);
      };
    }
    function populateSlot(id) {
      var save_element = document.getElementById('save_info_' + id);
      var save_button = document.getElementById('save_button_' + id);
      var delete_button = document.getElementById('delete_button_' + id);
      if (localStorage[TITLE+'_save_' + id]) {
        var timestamp = localStorage[TITLE+'_save_timestamp_' + id];
        save_element.textContent = timestamp;
        save_button.textContent = "Load";
        save_button.onclick = createLoadListener(id);
        delete_button.onclick = createDeleteListener(id);
      } else {
        save_button.textContent = "Save";
        save_element.textContent = "Empty";
        save_button.onclick = createSaveListener(id);
      }
    }
    for (var i = 0; i < max_slots; i++) {
      populateSlot(i);
    }
    for (i = 0; i < max_auto_slots; i++) {
      populateSlot('a'+i);
    }
  };

  window.showSaveSlots = function() {
    var save_element = document.getElementById('save');
    save_element.style.display = "flex";
    window.populateSaveSlots(8, 2);
    
    if (!save_element.onclick) {
      save_element.onclick = function(evt) {
        var target = evt.target;
        var save_element = document.getElementById('save');
        if (target == save_element) {
          window.hideSaveSlots();
        }
      };
    }
  };

  window.hideSaveSlots = function() {
    var save_element = document.getElementById('save');
    save_element.style.display = "none";
  };

  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root') {
      window.autosave();
    }
  };

  window.dendryModifyUI = main;
  console.log("Adventure Chat Interface Loaded - Full Quest");

}());