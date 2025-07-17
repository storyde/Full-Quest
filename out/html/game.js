(function() {
  var game;
  var ui;
  var messageQueue = [];
  var isTyping = false;
  var currentCharacter = null;
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
    'guide': { name: 'Eldara', avatar: 'E', class: 'character-1' },
    'companion': { name: 'Theron', avatar: 'T', class: 'character-2' },
    'stranger': { name: 'Mystic', avatar: 'M', class: 'character-3' },
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
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
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
        // Focus management for accessibility
        sidebar.setAttribute('aria-hidden', 'false');
        var firstFocusable = sidebar.querySelector('button, [tabindex="0"]');
        if (firstFocusable) firstFocusable.focus();
      }
    } else {
      sidebar.classList.toggle('hidden');
      sidebar.setAttribute('aria-hidden', sidebar.classList.contains('hidden'));
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
        // Focus management for accessibility
        sidebar.setAttribute('aria-hidden', 'false');
        var firstFocusable = sidebar.querySelector('button, [tabindex="0"]');
        if (firstFocusable) firstFocusable.focus();
      }
    } else {
      sidebar.classList.toggle('hidden');
      sidebar.setAttribute('aria-hidden', sidebar.classList.contains('hidden'));
    }
  }

  function closeSidebars() {
    var progressSidebar = document.getElementById('progress-sidebar');
    var contextSidebar = document.getElementById('context-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    
    progressSidebar.classList.remove('active');
    contextSidebar.classList.remove('active');
    overlay.classList.remove('active');
    
    // Reset aria-hidden for accessibility
    progressSidebar.setAttribute('aria-hidden', 'true');
    contextSidebar.setAttribute('aria-hidden', 'true');
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
    
    // Show notification
    showNotification('Theme changed to ' + currentTheme + ' mode', 'success');
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

  function showNotification(message, type) {
    // Create a simple notification system
    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--secondary-bg);
      color: var(--text-primary);
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 16px var(--shadow-medium);
      border-left: 4px solid var(--golden-accent);
      z-index: 3000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(function() {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(function() {
      notification.style.transform = 'translateX(100%)';
      setTimeout(function() {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  function displayChatContent(content) {
    var chatContainer = document.getElementById('content');
    
    // Parse content and determine message type
    var messageData = parseContentForChat(content);
    
    // Add typing indicator for non-user messages
    if (messageData.character !== 'user') {
      showTypingIndicator(messageData.character);
      
      // Simulate realistic typing delay
      var typingDelay = Math.min(messageData.text.length * 50, 3000) + Math.random() * 1000;
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
    
    // Add some fantasy flavor to narration
    if (character === 'narrator') {
      text = enhanceNarrationText(text);
    }
    
    return {
      character: character,
      text: text,
      timestamp: new Date()
    };
  }

  function enhanceNarrationText(text) {
    // Add some mystical elements to narration
    var enhancements = [
      { pattern: /\bbegin/gi, replacement: '✦ begin' },
      { pattern: /\bmagic/gi, replacement: '✨ magic' },
      { pattern: /\bquest/gi, replacement: '⚔️ quest' },
      { pattern: /\bmystery/gi, replacement: '🔮 mystery' }
    ];
    
    enhancements.forEach(function(enhancement) {
      text = text.replace(enhancement.pattern, enhancement.replacement);
    });
    
    return text;
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
    
    // Add narration icon for narrator messages
    if (messageData.character === 'narrator') {
      html += '<div class="narration-icon"><span uk-icon="icon: star; ratio: 1.5"></span></div>';
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
        button.setAttribute('aria-disabled', 'true');
      }
      
      var choiceText = choice.title || choice.text || 'Continue';
      button.innerHTML = '<span uk-icon="icon: chevron-right" class="choice-icon"></span><span>' + choiceText + '</span>';
      
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
    choicesContainer.style.transform = 'translateY(20px)';
    
    setTimeout(function() {
      choicesContainer.innerHTML = '';
      choicesContainer.style.display = 'none';
      choicesContainer.style.opacity = '1';
      choicesContainer.style.transform = 'translateY(0)';
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
        icon.className = 'progress-icon completed';
      }
      
      // Add completion animation
      progressItems[index].style.transform = 'scale(1.05)';
      setTimeout(function() {
        progressItems[index].style.transform = 'scale(1)';
      }, 200);
      
      showNotification('Progress updated!', 'success');
    }
  }

  function updateContext(messageData) {
    // Update location based on message content
    var locationCard = document.querySelector('.location-card');
    if (locationCard && messageData.text.includes('forest')) {
      updateLocation('Enchanted Forest', 'A mystical woodland where ancient magic flows through every leaf and branch.');
    }
    
    // Update recent events
    var eventsList = document.querySelector('.events-list');
    if (eventsList) {
      var newEvent = document.createElement('div');
      newEvent.className = 'event-item';
      newEvent.innerHTML = '<span uk-icon="icon: history" class="event-icon"></span><span class="event-text">' + 
                           messageData.text.substring(0, 50) + (messageData.text.length > 50 ? '...' : '') + '</span>';
      
      eventsList.insertBefore(newEvent, eventsList.firstChild);
      
      // Keep only the last 5 events
      var events = eventsList.querySelectorAll('.event-item');
      if (events.length > 5) {
        eventsList.removeChild(events[events.length - 1]);
      }
    }
  }

  function updateLocation(name, description) {
    var locationInfo = document.querySelector('.location-info');
    if (locationInfo) {
      locationInfo.querySelector('h5').textContent = name;
      locationInfo.querySelector('p').textContent = description;
    }
  }

  // Enhanced save/load system with notifications
  var TITLE = "Full Quest" + '_' + "storyde";

  window.quickSave = function() {
    var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
    localStorage[TITLE+'_save_q'] = saveString;
    showNotification('Game saved successfully!', 'success');
  };

  window.saveSlot = function(slot) {
    var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
    localStorage[TITLE+'_save_' + slot] = saveString;
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    var date = new Date(Date.now());
    date = scene + '\n(' + date.toLocaleString(undefined, DateOptions) + ')';
    localStorage[TITLE+'_save_timestamp_' + slot] = date;
    window.populateSaveSlots(slot + 1, 2);
    showNotification('Game saved to slot ' + slot + '!', 'success');
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
    window.populateSaveSlots(slot + 1, 2);
  };

  window.quickLoad = function() {
    if (localStorage[TITLE+'_save_q']) {
      var saveString = localStorage[TITLE+'_save_q'];
      window.dendryUI.dendryEngine.setState(JSON.parse(saveString));
      showNotification('Game loaded successfully!', 'success');
    } else {
      showNotification('No quick save available.', 'warning');
    }
  };

  window.loadSlot = function(slot) {
    if (localStorage[TITLE+'_save_' + slot]) {
      var saveString = localStorage[TITLE+'_save_' + slot];
      window.dendryUI.dendryEngine.setState(JSON.parse(saveString));
      window.hideSaveSlots();
      showNotification('Game loaded from slot ' + slot + '!', 'success');
    } else {
      showNotification('No save available in slot ' + slot + '.', 'warning');
    }
  };

  window.deleteSlot = function(slot) {
    if (localStorage[TITLE+'_save_' + slot]) {
      localStorage[TITLE+'_save_' + slot] = '';
      localStorage[TITLE+'_save_timestamp_' + slot] = '';
      window.populateSaveSlots(slot + 1, 2);
      showNotification('Save deleted from slot ' + slot + '.', 'success');
    } else {
      showNotification('No save available in slot ' + slot + '.', 'warning');
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
    
    // Focus management
    var firstButton = save_element.querySelector('button');
    if (firstButton) {
      setTimeout(function() {
        firstButton.focus();
      }, 100);
    }
    
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

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('stats')) {
      window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
      window.dendryUI.dendryEngine.goToScene('stats');
    }
  };

  window.showOptions = function() {
    var options_element = document.getElementById('options');
    window.populateOptions();
    options_element.style.display = "flex";
    
    // Focus management
    var firstInput = options_element.querySelector('input');
    if (firstInput) {
      setTimeout(function() {
        firstInput.focus();
      }, 100);
    }
    
    if (!options_element.onclick) {
      options_element.onclick = function(evt) {
        var target = evt.target;
        var options_element = document.getElementById('options');
        if (target == options_element) {
          window.hideOptions();
        }
      };
    }
  };

  window.hideOptions = function() {
    var options_element = document.getElementById('options');
    options_element.style.display = "none";
  };

  window.disableBg = function() {
    window.dendryUI.disable_bg = true;
    document.body.style.backgroundImage = 'none';
    window.dendryUI.saveSettings();
    showNotification('Backgrounds disabled', 'success');
  };

  window.enableBg = function() {
    window.dendryUI.disable_bg = false;
    window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
    window.dendryUI.saveSettings();
    showNotification('Backgrounds enabled', 'success');
  };

  window.disableAnimate = function() {
    window.dendryUI.animate = false;
    window.dendryUI.saveSettings();
    showNotification('Animations disabled', 'success');
  };

  window.enableAnimate = function() {
    window.dendryUI.animate = true;
    window.dendryUI.saveSettings();
    showNotification('Animations enabled', 'success');
  };

  window.disableAnimateBg = function() {
    window.dendryUI.animate_bg = false;
    window.dendryUI.saveSettings();
    showNotification('Background animations disabled', 'success');
  };

  window.enableAnimateBg = function() {
    window.dendryUI.animate_bg = true;
    window.dendryUI.saveSettings();
    showNotification('Background animations enabled', 'success');
  };

  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var animate_bg = window.dendryUI.animate_bg;
    if (disable_bg) {
      document.getElementById('backgrounds_no').checked = true;
    } else {
      document.getElementById('backgrounds_yes').checked = true;
    }
    if (animate) {
      document.getElementById('animate_yes').checked = true;
    } else {
      document.getElementById('animate_no').checked = true;
    }
    if (animate_bg) {
      document.getElementById('animate_bg_yes').checked = true;
    } else {
      document.getElementById('animate_bg_no').checked = true;
    }
  };

  window.displayText = function(text) {
    return text;
  };

  window.handleSignal = function(signal, event, scene_id) {
    // Handle game signals for enhanced interactivity
  };

  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root') {
      window.autosave();
    }
  };

  window.updateSidebar = function() {
    // Update context sidebar with current game state
    var contextContent = document.getElementById('context-content');
    var scene = dendryUI.game.scenes.status;
    if (scene) {
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      // Update context with enhanced formatting
      updateContextDisplay(displayContent);
    }
  };

  function updateContextDisplay(content) {
    // Enhanced context display with better formatting
    var contextContent = document.getElementById('context-content');
    if (contextContent && content) {
      // Process the content for better display
      var processedContent = content.replace(/\n/g, '<br>');
      var contextHtml = '<div class="context-section">';
      contextHtml += '<h4>Game Status</h4>';
      contextHtml += '<div class="status-content">' + processedContent + '</div>';
      contextHtml += '</div>';
      
      // Update only the status section, preserve other sections
      var existingContent = contextContent.innerHTML;
      var statusRegex = /<div class="context-section">[\s\S]*?<h4>Game Status<\/h4>[\s\S]*?<\/div>/;
      if (statusRegex.test(existingContent)) {
        contextContent.innerHTML = existingContent.replace(statusRegex, contextHtml);
      } else {
        contextContent.innerHTML += contextHtml;
      }
    }
  }

  window.onDisplayContent = function() {
    window.updateSidebar();
  };

  window.dendryModifyUI = main;
  console.log("Fantasy Chat Messenger Interface Loaded - Full Quest v2.0");

  window.onload = function() {
    window.dendryUI.loadSettings();
  };

}());