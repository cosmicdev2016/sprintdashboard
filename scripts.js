//Upload data - Build File input and associate events
function bs_input_file() {
	$(".input-file").before(
		function() {
			if ( ! $(this).prev().hasClass('input-ghost') ) {
				var element = $("<input type='file' class='input-ghost' style='visibility:hidden; height:0'>");
				element.attr("name",$(this).attr("name"));
				element.change(function(){
					element.next(element).find('input').val((element.val()).split('\\').pop());
				});
				$(this).find("button.btn-choose").click(function(){
					element.click();
				});
				$(this).find("button.btn-reset").click(function(){
					element.val(null);
					$(this).parents(".input-file").find('input').val('');
				});
				$(this).find('input').css("cursor","pointer");
				$(this).find('input').mousedown(function() {
					$(this).parents('.input-file').prev().click();
					return false;
				});
				return element;
			}
		}
	);
}

//Cleanup UI elements and localStorage
function clearDB() {
	// cleanup UI
	$('#todo li').remove();
	$('#devinprogress li').remove();
	$('#qainprogress li').remove();
	$('#done li').remove();
	
	//cleanup localStorage
	localStorage.clear();
}

//Save state of the dashboard to localStorage
function saveDB() {
	//document.getElementById("todo").children[2].innerHTML
	saveToStorage("todo");
	saveToStorage("devinprogress");
	saveToStorage("qainprogress");
	saveToStorage("done");
	
	showAlert('saveDashboardSuccessAlert');
}

function saveToStorage(elementId) {
	var data = [];
	$.each(document.getElementById(elementId).children, function(index, element) {
		data.push({
			id : Number.parseInt(element.id),
			value : element.innerHTML});
	});
	localStorage.setItem(elementId, JSON.stringify(data));
}

function loadFromStorage(elementId) {
	// clear the existing list
	$('#' + elementId + ' li').remove();
	
	var data = JSON.parse(localStorage.getItem(elementId));
	$.each(data, function(index, entry) {
		$('#' + elementId).append('<li id="' + entry.id + '" draggable="true" data-toggle="modal" data-target="#exampleModal" data-usnumber="' + entry.value + '">' + entry.value + '</li>');
		$("#" + entry.id).on("click", function() {
			//alert(entry.id);
			//NO NEED to bind click to display modal
			//data-target -> takes care of that
		});
	});
}

//Download json file - Backup the current dashboard state
function download() {
	var data = [];
	var obj = {todo : JSON.parse(localStorage.getItem("todo") == null ? "[]" : localStorage.getItem("todo"))};
	data.push(obj);
	obj = {devinprogress : JSON.parse(localStorage.getItem("devinprogress") == null ? "[]" : localStorage.getItem("devinprogress"))};
	data.push(obj);
	obj = {qainprogress : JSON.parse(localStorage.getItem("qainprogress") == null ? "[]" : localStorage.getItem("qainprogress"))};
	data.push(obj);
	obj = {done : JSON.parse(localStorage.getItem("done") == null ? "[]" : localStorage.getItem("done"))};
	data.push(obj);
	//add the US dataInfo Map
	obj = {usInfoMap : JSON.parse(localStorage.getItem("usInfoMap") == null ? "{}" : localStorage.getItem("usInfoMap"))};
	data.push(obj);
	
	var json = JSON.stringify(data);
	var blob = new Blob([json], {type: "application/json"});
	var url  = URL.createObjectURL(blob);

	var a = document.createElement('a');
	a.download    = "backup.json";
	a.href        = url;
	//a.textContent = "Download backup.json";

	var e    = document.createEvent('MouseEvents');
	a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
	e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	a.dispatchEvent(e);
}

function update_list() {
	// clear the existing list
	/*$('#todo li').remove();

	$.each(updatedUsers, function(index,userName) {
		$('#todo').append('<li id="name' + index + '" draggable="true">'+userName+'</li>')
	});*/
	
	loadFromStorage("todo");
	loadFromStorage("devinprogress");
	loadFromStorage("qainprogress");
	loadFromStorage("done");
}

function hideAlert(id) {
	$('#' + id).removeClass('show');
	$('#' + id).fadeTo(0, 0).slideUp(0, function(){
		//do nothing
	});
}

function showAlert(id) {
	$('#' + id).css('opacity', 1).slideDown();
	setTimeout(function() {
		$('#' + id).fadeTo(500, 0).slideUp(500, function() {
			//do nothing
		});
	}, 5000);
}

//Bind drag events to the US cards
function bindEvents() {
	$('li').bind('dragstart', function(event) {
		event.originalEvent.dataTransfer.setData("text/plain",  event.target.getAttribute('id'));
		//Feature : added page scroll if element dragged - start
		stop = true;

		if (event.originalEvent.clientY < 150) {
			stop = false;
			scroll(-1)
		}

		if (event.originalEvent.clientY > ($(window).height() - 150)) {
			stop = false;
			scroll(1)
		}
		//Feature : added page scroll if element dragged - end
	});

	$('ul').bind('dragover', function(event) {
		event.preventDefault();
	});

	$('ul').bind('dragenter', function(event) {
		$(this).addClass("over");
	});

	$('ul').bind('dragleave drop', function(event) {
		$(this).removeClass("over");
		//Feature : added page scroll if element dragged
		stop = true;
	});

	$('li').bind('drop', function(event) {
		return false;
		//Feature : added page scroll if element dragged
		stop = true;
	});

	$('ul').bind('drop', function(event) {
		var listitem = event.originalEvent.dataTransfer.getData("text/plain");
		event.target.appendChild(document.getElementById(listitem));
		event.preventDefault();
		//document.getElementById(listitem).innerHTML
		//event.target.id
		
		//Feature : added page scroll if element dragged
		stop = true;
	});
}

//Self invoking function - To Bind click and other events to Buttons, etc
$(function(){
	
	//Tab 1 - '+' click event
	$(document).on('click', '.btn-add', function(e){
		e.preventDefault();

		var controlForm = $('.controls form:first'),
			currentEntry = $(this).parents('.entry:first'),
			newEntry = $(currentEntry.clone()).appendTo(controlForm);

		newEntry.find('input').val('');
		controlForm.find('.entry:not(:last) .btn-add')
			.removeClass('btn-add').addClass('btn-remove')
			.removeClass('btn-success').addClass('btn-danger')
			.html('<span class="glyphicon glyphicon-minus"></span>');
	}).on('click', '.btn-remove', function(e){
		$(this).parents('.entry:first').remove();

		e.preventDefault();
		return false;
	});
	
	//Tab 1 - Saves all the US numbers to localStorage
	$('#saveSetup').click(function(){
		var todos = JSON.parse(localStorage.getItem("todo"));
		if (todos == null) {
			todos = [];
		}
		
		var millis = new Date().getTime();
		var count = 1;
		var validationFail = false;
		$('input[name^=fields]').each(function(){
			var obj = {
				id : (millis + count),
				value : $(this).val().trim()
			};
			if (obj.value === '') {
				validationFail = true;
				bootbox.alert('User Story # cannot be blank. Please provide a value.');
				return false;
			} else {
				todos.push(obj);
				count++;
			}
		});
		
		if(!validationFail) {
			localStorage.setItem("todo", JSON.stringify(todos));
			
			//cleanup form
			var controlForm = $('.controls form:first');
			var newEntry = $('.entry:last').clone();
			newEntry.find('input').val('');
			$('.entry').remove();
			$(newEntry).appendTo(controlForm);
			
			showAlert('saveSuccessAlert');
		}
		return false;
	});
	
	//Tab 1 - Upload the json file to setup dashboard
	$('#upload').on('click', function(e) {
		var fileName = $('#fileName').val();
		if (fileName === "" || fileName === null) {
			bootbox.alert('File name cannot be blank. Please choose a json file.');
		} else {
			var files = $('.input-ghost')[0].files;
			if (files.item(0) !== null) {
				var fr = new FileReader();
				fr.onload = function(e) { 
					var result = JSON.parse(e.target.result);
					//cleanup localStorage before loading data
					localStorage.clear();
					//load data into localstorage from json file
					localStorage.setItem("todo", JSON.stringify(result[0].todo));
					localStorage.setItem("devinprogress", JSON.stringify(result[1].devinprogress));
					localStorage.setItem("qainprogress", JSON.stringify(result[2].qainprogress));
					localStorage.setItem("done", JSON.stringify(result[3].done));
					localStorage.setItem("usInfoMap", JSON.stringify(result[4].usInfoMap));
				}

				fr.readAsText(files.item(0));
				//reset file name
				$("#uploadForm")[0].reset();
				//display success alert
				showAlert('uploadSuccessAlert');
			}
		}
	});
	
	//Tab 2 - Handle the click event on the US card and display the US detail Modal dialog
	$('#exampleModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget); // Button that triggered the modal
		if (button[0] !== undefined) {
			var recordId = button[0].id;
			var usNumber = button.data('usnumber'); // Extract info from data-* attributes
			// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
			// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
			var modal = $(this);
			modal.find('.modal-title').text("User Story # : " + usNumber);
			modal.find('#recordId').val(recordId);
			var usInfoMap = JSON.parse(localStorage.getItem("usInfoMap"));
			if (usInfoMap !== null) {
				var usData = usInfoMap['id' + recordId];
				if (usData !== undefined) {
					$('#usData input#us-description').val(usData.description);
					$('#usData input#name-dev').val(usData.nameDev);
					$('#usData input#name-qa').val(usData.nameQa);
					$('#usData input#delivery-date').val(usData.deliveryDate);
					$('#usData input#days-remaining').val('');

					//calculate days remaining
					if (usData.deliveryDate !== '') {
						var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
						var futureDate = new Date(usData.deliveryDate);
						var currentDate = new Date();
						var diffDays = Math.ceil((futureDate.getTime() - currentDate.getTime())/(oneDay));
						
						$('#usData input#days-remaining').val(diffDays);
					}
				} else {
					$('#usData input#us-description').val('');
					$('#usData input#name-dev').val('');
					$('#usData input#name-qa').val('');
					$('#usData input#delivery-date').val('');
					$('#usData input#days-remaining').val('');
				}
			} else {
				$('#usData input#us-description').val('');
				$('#usData input#name-dev').val('');
				$('#usData input#name-qa').val('');
				$('#usData input#delivery-date').val('');
				$('#usData input#days-remaining').val('');
			}
		}
	});
	
	//US detail Modal dialog - Handle Save event to save the US details
	$('#saveUSData').on('click', function(e) {
		var id = $('#usData input#recordId').val();
		var description = $('#usData input#us-description').val();
		var nameDev = $('#usData input#name-dev').val();
		var nameQa = $('#usData input#name-qa').val();
		var deliveryDate = $('#usData input#delivery-date').val();
		
		var usInfoMap = JSON.parse(localStorage.getItem("usInfoMap"));
		if (usInfoMap === undefined || usInfoMap === null) {
			usInfoMap = {};
		}
		usInfoMap['id' + id] = {
			description : description,
			nameDev : nameDev,
			nameQa : nameQa,
			deliveryDate : deliveryDate
		};
		localStorage.setItem("usInfoMap", JSON.stringify(usInfoMap));
		$('#exampleModal').modal('hide');
	});
});

$(document).ready(function(){
	
	bs_input_file();
	
	//Tab 1 - hide the success alerts
	hideAlert('saveSuccessAlert');
	hideAlert('uploadSuccessAlert');

	//Tab 2 - hide the success alerts
	hideAlert('saveDashboardSuccessAlert');
	
	//Tab 1 - hide the reset button
	var eleResetBtn = $('#uploadForm').find('button')[2];
	$(eleResetBtn).hide();
	
	update_list();

	//Feature : added page scroll if element dragged - start
	var stop = true;
	var scroll = function (step) {
		var scrollY = $(window).scrollTop();
		$(window).scrollTop(scrollY + step);
		if (!stop) {
			setTimeout(function () { scroll(step) }, 20);
		}
	}
	//Feature : added page scroll if element dragged - end
	
	bindEvents();
  
	//On Tab toggle
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		var target = $(e.target).attr("href"); // activated tab
		if (target === '#2b') {
			update_list();
			bindEvents();
		}
	});
		
	$('#delivery-date').datepicker({
		autoclose: true,
		todayHighlight: true
	});
		
});