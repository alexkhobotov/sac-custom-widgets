(function() { 
	let shadowRoot;
	let callcount = 0;

	let scriptsLoadPromise;

	let template = document.createElement("template");
	template.innerHTML = `
		<style>
		</style> 
	`;
	
	const div = document.createElement('div');
    div.innerHTML = '<div id="chart_div"></div>';
	
	//External scripts ULs
	let googleloaderjs = "https://www.gstatic.com/charts/loader.js";
	let ganttjs = "https://alexkhobotov.github.io/sac-custom-widgets/gantt.js"
	
	//Script loading with callback on load
	function loadScript(src, callback) {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		script.addEventListener("load", callback);
		shadowRoot.appendChild(script);
    }
	
	//Google chart rendering
	function drawChart(data_set) {

		let data = dataSetToGoogleData(data_set);

		if (data && data.getNumberOfRows() !== 0){

			var options = {
			height: 275
			};

			var chart = new google.visualization.Gantt(div);

			chart.draw(data, options);
		}
    }
	
	//Google Chart 
    function GoogleChart(data_set){
		google.charts.setOnLoadCallback(function(){ drawChart(data_set) });
    }

	function dataSetToGoogleData(data_set){
		let prepared_data = new google.visualization.DataTable();
		prepared_data.addColumn('string', 'Task ID');
		prepared_data.addColumn('string', 'Task Name');
		prepared_data.addColumn('string', 'Resource');
		prepared_data.addColumn('date', 'Start Date');
		prepared_data.addColumn('date', 'End Date');
		prepared_data.addColumn('number', 'Duration');
		prepared_data.addColumn('number', 'Percent Complete');
		prepared_data.addColumn('string', 'Dependencies');
		if (data_set){
			data_set.forEach(row => {
				//console.log(row);
				prepared_data.addRows([
					[row.Event_Id.id, row.Event_Name.id, row.Event_Category.id,
					new Date(row.Start_Date.id), new Date(row.End_Date.id), null,  100,  (row.Dependent_On.id === '#') ? null : row.Dependent_On.id]
					]);
			})
		}
		return prepared_data;
	}

	class GoogleGunttChart extends HTMLElement {
		constructor() {
			super(); 
			shadowRoot = this.attachShadow({mode: "open"});

			//load all required scripts and create promise to call dependant code after
			scriptsLoadPromise = new Promise((resolve,reject)=>{
				loadScript(googleloaderjs, function(){
					console.log("Load:" + googleloaderjs);
					loadScript(ganttjs, function() {
						console.log("Load:" + ganttjs);
						resolve("scripts are loaded");
					});
				});
			});

			//append template
			shadowRoot.appendChild(template.content.cloneNode(true));
			
			//append div for google chart
            shadowRoot.appendChild(div);
			
			//add onClick listener
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
			callcount = callcount + 1;
			console.log(callcount);
			if ("color" in changedProperties) {
				this.style["background-color"] = changedProperties["color"];
			}
			if ("opacity" in changedProperties) {
				this.style["opacity"] = changedProperties["opacity"];
			}

			var that = this;

			//sequence of data manipulation and chart rendering steps after all scripts are loaded
			scriptsLoadPromise.then(() => {
				const dataBinding = that.dataBindings.getDataBinding('myDataBinding');
				return dataBinding.getDataSource().getResultSet();
			}).then((data_set)=>{
				GoogleChart(data_set);
			});
		}
	}

	customElements.define("com-ies-ea-googleganttchart", GoogleGunttChart);
})();
