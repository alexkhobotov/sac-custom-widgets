(function() { 
	let shadowRoot;
	let dataBinding;
	
	let template = document.createElement("template");
	template.innerHTML = `
		<style>
		</style> 
	`;
	
	const div = document.createElement('div');
        div.innerHTML = '<div id="chart_div"></div>';
	
	//let googleloaderjs = document.createElement("script");
    	//googleloaderjs.src = "https://www.gstatic.com/charts/loader.js";
	let googleloaderjs = "https://www.gstatic.com/charts/loader.js";
	
	let ganttjs = "https://alexkhobotov.github.io/sac-custom-widgets/gantt.js"
	
	
	function loadScript(src, callback) {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		script.addEventListener("load", callback);
		shadowRoot.appendChild(script);
    }
	
	
	function daysToMilliseconds(days) {
      		return days * 24 * 60 * 60 * 1000;
    	}
	
	
	
	function drawChart() {
	      var data = new google.visualization.DataTable();
	      data.addColumn('string', 'Task ID');
	      data.addColumn('string', 'Task Name');
		  data.addColumn('string', 'Resource');
	      data.addColumn('date', 'Start Date');
	      data.addColumn('date', 'End Date');
	      data.addColumn('number', 'Duration');
	      data.addColumn('number', 'Percent Complete');
	      data.addColumn('string', 'Dependencies');

	      data.addRows([
		['Upgrade_tst', 'Upgrade IBP TEST', 'system',
		 new Date(2021, 11, 28), new Date(2022, 0, 5), null,  100,  null],
		['Upgrade', 'Upgrade IBP PROD', 'system',
		 new Date(2022, 0, 5), new Date(2022, 0, 10), null,  100,  'Upgrade_tst'],
		['TR', 'Load Transactional Data to IBP', 'data load',
		 null, new Date(2022, 0, 14), daysToMilliseconds(3), 25, 'Upgrade,MD'],
		['MD', 'Load Master Data to IBP', 'data load',
		new Date(2022, 0, 10), new Date(2022, 0, 11), daysToMilliseconds(1), 100, 'Upgrade']
	      ]);

	      var options = {
		height: 275
	      };
		
		console.log(div);

	      var chart = new google.visualization.Gantt(div);

	      chart.draw(data, options);
    	}
	
	// Google Chart
    function GoogleChart(){
		google.charts.setOnLoadCallback(function(){ drawChart() });
    }

	async function loadDataBinding(){
		dataBinding = await this.myDataBinding;
	}

	class AlexBox extends HTMLElement {
		constructor() {
			super(); 
			shadowRoot = this.attachShadow({mode: "open"});
			//shadowRoot.appendChild(googleloaderjs);
			shadowRoot.appendChild(template.content.cloneNode(true));
			
			//create div for google chart
                	shadowRoot.appendChild(div);
			
			this.addEventListener("click", event => {
				var event = new Event("onClick");
				this.dispatchEvent(event);
			});
			
			this._props = {};
		}

		onCustomWidgetBeforeUpdate(changedProperties) {
			this._props = { ...this._props, ...changedProperties };
		}

		onCustomWidgetAfterUpdate(changedProperties) {
			if ("color" in changedProperties) {
				this.style["background-color"] = changedProperties["color"];
			}
			if ("opacity" in changedProperties) {
				this.style["opacity"] = changedProperties["opacity"];
			}
			
			//google.charts.load('current', {'packages':['gantt']});
   			//google.charts.setOnLoadCallback(drawChart);
			
			loadScript(googleloaderjs, function(){
				console.log("Load:" + googleloaderjs);
				loadScript(ganttjs, function() {
					console.log("Load:" + ganttjs);
					GoogleChart();
				});
			});

			loadDataBinding();
			console.log(dataBinding);
			// Traverse result set
			dataBinding.data.forEach(row => {
				console.log(row);
  			})
  
		}
	}

	customElements.define("com-alex-khobotov-box", AlexBox);
})();
