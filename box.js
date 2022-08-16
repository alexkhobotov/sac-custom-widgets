(function() { 
	let shadowRoot;
	
	let template = document.createElement("template");
	template.innerHTML = `
		<style>
		</style> 
	`;
	
	let googleloaderjs = document.createElement("script");
    	googleloaderjs.src = "https://www.gstatic.com/charts/loader.js";
	
	let ganttjs = "https://alexkhobotov.github.io/sac-custom-widgets/gantt.js"
	
	
	function loadScript(src, callback) {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		script.addEventListener("load", callback);
		shadowRoot.appendChild(script);
    	};
	
	
	function daysToMilliseconds(days) {
      		return days * 24 * 60 * 60 * 1000;
    	}
	
	function drawChart() {
	      var data = new google.visualization.DataTable();
	      data.addColumn('string', 'Task ID');
	      data.addColumn('string', 'Task Name');
	      data.addColumn('date', 'Start Date');
	      data.addColumn('date', 'End Date');
	      data.addColumn('number', 'Duration');
	      data.addColumn('number', 'Percent Complete');
	      data.addColumn('string', 'Dependencies');

	      data.addRows([
		['Research', 'Find sources',
		 new Date(2015, 0, 1), new Date(2015, 0, 5), null,  100,  null],
		['Write', 'Write paper',
		 null, new Date(2015, 0, 9), daysToMilliseconds(3), 25, 'Research,Outline'],
		['Cite', 'Create bibliography',
		 null, new Date(2015, 0, 7), daysToMilliseconds(1), 20, 'Research'],
		['Complete', 'Hand in paper',
		 null, new Date(2015, 0, 10), daysToMilliseconds(1), 0, 'Cite,Write'],
		['Outline', 'Outline paper',
		 null, new Date(2015, 0, 6), daysToMilliseconds(1), 100, 'Research']
	      ]);

	      var options = {
		height: 275
	      };

	      var chart = new google.visualization.Gantt(document.getElementById('chart_div'));

	      chart.draw(data, options);
    	}
	
	// Google Chart
    	function GoogleChart() {
        	google.charts.setOnLoadCallback(drawChart());
    	};

	class AlexBox extends HTMLElement {
		constructor() {
			super(); 
			shadowRoot = this.attachShadow({mode: "open"});
			shadowRoot.appendChild(googleloaderjs);
			shadowRoot.appendChild(template.content.cloneNode(true));
			
			//create div for google chart
			const div = document.createElement('div');
                	div.innerHTML = '<div id="chart_div"></div>';
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
			

                    	loadScript(ganttjs, function() {
                        	console.log("Load:" + ganttjs);
                       		GoogleChart();
                    	});
		}
	}

	customElements.define("com-alex-khobotov-box", AlexBox);
})();
