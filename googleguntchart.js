(function() { 
	let shadowRoot;
	let callcount = 0;

	let data;
	
	let scriptsLoadPromise = new Promise();

	let template = document.createElement("template");
	template.innerHTML = `
		<style>
		</style> 
	`;
	
	const div = document.createElement('div');
    div.innerHTML = '<div id="chart_div"></div>';
	
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
		if (data && data.getNumberOfRows() !== 0){

			var options = {
			height: 275
			};

			var chart = new google.visualization.Gantt(div);

			chart.draw(data, options);
		}
    }
	
	// Google Chart
    function GoogleChart(){
		google.charts.setOnLoadCallback(function(){ drawChart() });
    }

	async function loadAllScripts(){

	}

	class GoogleGunttChart extends HTMLElement {
		constructor() {
			super(); 
			shadowRoot = this.attachShadow({mode: "open"});
			//shadowRoot.appendChild(googleloaderjs);
			shadowRoot.appendChild(template.content.cloneNode(true));
			
			//create div for google chart
            shadowRoot.appendChild(div);

			loadScript(googleloaderjs, function(){
				console.log("Load:" + googleloaderjs);
				loadScript(ganttjs, function() {
					console.log("Load:" + ganttjs);
					scriptsLoadPromise.resolve("scripts are loaded");
				});
			});
			
			this.addEventListener("click", event => {
				var event = new Event("onClick");
				this.dispatchEvent(event);
			});
			
		
			this._props = {};
		}

		onCustomWidgetBeforeUpdate(changedProperties) {
			this._props = { ...this._props, ...changedProperties };
		}

		async onCustomWidgetAfterUpdate(changedProperties) {
			callcount = callcount + 1;
			console.log(callcount);
			if ("color" in changedProperties) {
				this.style["background-color"] = changedProperties["color"];
			}
			if ("opacity" in changedProperties) {
				this.style["opacity"] = changedProperties["opacity"];
			}

			var that = this;

			scriptsLoadPromise.then(() => {
				const dataBinding = this.dataBindings.getDataBinding('myDataBinding');
				let data_set = dataBinding.getDataSource().getResultSet();
				console.log(data_set);
			}).then(()=>{
				let prepared_data = this.dataSetToGoogleData(data_set);
				console.log(prepared_data);
				data = prepared_data;
			}).then(()=>{
				GoogleChart();
			});

			/*
			
			if (callcount === 1){

				loadScript(googleloaderjs, function(){
					console.log("Load:" + googleloaderjs);
					loadScript(ganttjs, function() {
						console.log("Load:" + ganttjs);
						//GoogleChart();
						//console.log("Chart drown");
					});
				});
			}
			else{
				const dataBinding = this.dataBindings.getDataBinding('myDataBinding');
				let data_set = await dataBinding.getDataSource().getResultSet();
				console.log(data_set);
				//let widget_data = await this.getData(); //how to make shure that data is loaded?
				//let prepared_data = await this.prepareData(widget_data);
				let prepared_data = await this.dataSetToGoogleData(data_set);
				console.log(prepared_data);
				data = prepared_data;
				GoogleChart();
			}
			*/
		}

		/*
		async getData(){
			return await this.myDataBinding.data;
		}
		*/

		/*
		async prepareData(widget_data){
			let prepared_data = new google.visualization.DataTable();
			prepared_data.addColumn('string', 'Task ID');
			prepared_data.addColumn('string', 'Task Name');
			prepared_data.addColumn('string', 'Resource');
			prepared_data.addColumn('date', 'Start Date');
			prepared_data.addColumn('date', 'End Date');
			prepared_data.addColumn('number', 'Duration');
			prepared_data.addColumn('number', 'Percent Complete');
			prepared_data.addColumn('string', 'Dependencies');
			if (widget_data){
				widget_data.forEach(row => {
					console.log(row);
					prepared_data.addRows([
						[row.dimensions_0.id, row.dimensions_1.id, row.dimensions_2.id,
						new Date(row.dimensions_3.id), new Date(row.dimensions_4.id), null,  100,  (row.dimensions_6.id === '#') ? null : row.dimensions_6.id]
						]);
				})
			}
			return prepared_data;
		}
		*/

		async dataSetToGoogleData(data_set){
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
					console.log(row);
					prepared_data.addRows([
						[row.Event_Id.id, row.Event_Name.id, row.Event_Category.id,
						new Date(row.Start_Date.id), new Date(row.End_Date.id), null,  100,  (row.Dependent_On.id === '#') ? null : row.Dependent_On.id]
						]);
				})
			}
			return prepared_data;
		}
	}

	customElements.define("com-ies-ea-googleganttchart", GoogleGunttChart);
})();
