(function() {
  var game;
  var ui;
  var messageQueue = [];
  var isTyping = false;
  var currentCharacter = null;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  // Character profiles for the chat interface
  var characters = {
    'narrator': { name: 'Narrator', avatar: 'N', class: 'narration' },
    'guide': { name: 'Guide', avatar: 'G', class: 'character-1' },
    'companion': { name: 'Companion', avatar: 'C', class: 'character-2' },
    'stranger': { name: 'Stranger', avatar: 'S', class: 'character-3' },
    'user': { name: 'You', avatar: 'Y', class: 'user' }
  };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // Initialize chat interface
    initializeChatInterface();
    
    // Override the original content display
    ui.displayContent = displayChatContent;
    ui.displayChoices = displayChatChoices;
  };

  function initializeChatInterface() {
    // Initialize sidebar toggles
    document.getElementById('progress-toggle').addEventListener('click', toggleProgressSidebar);
    document.getElementById('context-toggle').addEventListener('click', toggleContextSidebar);

    // Initialize responsive behavior
    if (window.innerWidth <= 768) {
      document.getElementById('progress-sidebar').classList.add('hidden-left');
      document.getElementById('context-sidebar').classList.add('hidden-right');
    }

    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth <= 768) {
        document.getElementById('progress-sidebar').classList.add('hidden-left');
        document.getElementById('context-sidebar').classList.add('hidden-right');
      } else {
        document.getElementById('progress-sidebar').classList.remove('hidden-left', 'show');
        document.getElementById('context-sidebar').classList.remove('hidden-right', 'show');
      }
    });
  }

  function toggleProgressSidebar() {
    var sidebar = document.getElementById('progress-sidebar');
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('show');
    } else {
      sidebar.classList.toggle('hidden-left');
    }
  }

  function toggleContextSidebar() {
    var sidebar = document.getElementById('context-sidebar');
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('show');
    } else {
      sidebar.classList.toggle('hidden-right');
    }
  }

  function displayChatContent(content) {
    var chatContainer = document.getElementById('content');
    
    // Parse content and determine message type
    var messageData = parseContentForChat(content);
    
    // Add typing indicator
    if (messageData.character !== 'user') {
      showTypingIndicator(messageData.character);
      
      // Simulate typing delay
      setTimeout(function() {
        hideTypingIndicator();
        addChatMessage(messageData);
      }, 1000 + Math.random() * 1000);
    } else {
      addChatMessage(messageData);
    }
  }

  function parseContentForChat(content) {
    // Simple content parsing - in a real implementation, you'd have more sophisticated parsing
    var text = typeof content === 'string' ? content : content.text || '';
    
    // Determine character based on content patterns or context
    var character = 'narrator';
    if (text.includes('"') || text.includes(':')) {
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
    
    // Scroll to bottom
    var chatScrollContainer = document.getElementById('chat-container');
    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
    
    // Update progress if needed
    updateProgress(messageData);
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
    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
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
      
      if (choice.canChoose === false) {
        button.className += ' unavailable';
        button.disabled = true;
      }
      
      button.textContent = choice.title || choice.text || 'Continue';
      
      if (choice.canChoose !== false) {
        button.addEventListener('click', function() {
          // Add user message to chat
          addChatMessage({
            character: 'user',
            text: choice.title || choice.text || 'Continue',
            timestamp: new Date()
          });
          
          // Clear choices
          choicesContainer.innerHTML = '';
          choicesContainer.style.display = 'none';
          
          // Execute choice
          if (choice.id) {
            ui.choose(choice.id);
          } else if (typeof choice.choose === 'function') {
            choice.choose();
          }
        });
      }
      
      choicesContainer.appendChild(button);
    });
  }

  function updateProgress(messageData) {
    // Simple progress tracking - you can expand this based on your story structure
    var progressItems = document.querySelectorAll('.progress-item');
    
    // Example progress logic
    if (messageData.text.toLowerCase().includes('adventure') || messageData.text.toLowerCase().includes('quest')) {
      markProgressComplete(0);
    }
    if (messageData.character === 'guide' || messageData.character === 'companion') {
      markProgressComplete(1);
    }
    // Add more progress conditions as needed
  }

  function markProgressComplete(index) {
    var progressItems = document.querySelectorAll('.progress-item');
    if (progressItems[index] && !progressItems[index].classList.contains('completed')) {
      progressItems[index].classList.add('completed');
      var icon = progressItems[index].querySelector('[uk-icon]');
      if (icon) {
        icon.setAttribute('uk-icon', 'check');
        icon.className = 'uk-text-success uk-margin-small-right';
      }
    }
  }

  // TODO: change this!
  var TITLE = "Full Quest" + '_' + "storyde";

  window.quickSave = function() {
      var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
      localStorage[TITLE+'_save_q'] = saveString;
      UIkit.notification('Game saved!', {status: 'success'});
  };

  window.saveSlot = function(slot) {
      var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
      localStorage[TITLE+'_save_' + slot] = saveString;
      var scene = window.dendryUI.dendryEngine.state.sceneId;
      var date = new Date(Date.now());
      date = scene + '\n(' + date.toLocaleString(undefined, DateOptions) + ')';
      localStorage[TITLE+'_save_timestamp_' + slot] = date;
      window.populateSaveSlots(slot + 1, 2);
  };
  
  // writes an autosave slot
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
          UIkit.notification('Game loaded!', {status: 'success'});
      } else {
          UIkit.notification('No save available.', {status: 'warning'});
      }
  };

  window.loadSlot = function(slot) {
      if (localStorage[TITLE+'_save_' + slot]) {
          var saveString = localStorage[TITLE+'_save_' + slot];
          window.dendryUI.dendryEngine.setState(JSON.parse(saveString));
          window.hideSaveSlots();
          UIkit.notification('Game loaded!', {status: 'success'});
      } else {
          UIkit.notification('No save available.', {status: 'warning'});
      }
  };

  window.deleteSlot = function(slot) {
      if (localStorage[TITLE+'_save_' + slot]) {
          localStorage[TITLE+'_save_' + slot] = '';
          localStorage[TITLE+'_save_timestamp_' + slot] = '';
          window.populateSaveSlots(slot + 1, 2);
          UIkit.notification('Save deleted.', {status: 'primary'});
      } else {
          UIkit.notification('No save available.', {status: 'warning'});
      }
  };

  window.populateSaveSlots = function(max_slots, max_auto_slots) {
      // this fills in the save information
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
      save_element.style.display = "block";
      // magic number lol
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

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('stats')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('stats');
    }
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  // populates the checkboxes in the options view
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
  
  // This function allows you to modify the text before it's displayed.
  // E.g. wrapping chat-like messages in spans.
  window.displayText = function(text) {
      return text;
  };

  // This function allows you to do something in response to signals.
  window.handleSignal = function(signal, event, scene_id) {
  };
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root') {
        window.autosave();
    }
  };
    
  // This function updates the game sidebar.
  window.updateSidebar = function() {
      // Update context sidebar with current game state
      var contextContent = document.getElementById('context-content');
      var scene = dendryUI.game.scenes.status;
      if (scene) {
          var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
          var contextHtml = '<div class="uk-card uk-card-default uk-card-small">';
          contextHtml += '<div class="uk-card-body">';
          contextHtml += '<p class="uk-text-small">' + displayContent + '</p>';
          contextHtml += '</div></div>';
          contextContent.innerHTML = contextHtml;
      }
  };
  
  // This function runs on every new content display. Currently, all it does is update the sidebar.
  window.onDisplayContent = function() {
      window.updateSidebar();
  };

  window.dendryModifyUI = main;
  console.log("Chat Messenger Interface Loaded - Full Quest");

  window.onload = function() {
    window.dendryUI.loadSettings();
  };

}());