(()=>{"use strict";var e={922:function(e,t,s){var r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var s in e)Object.hasOwnProperty.call(e,s)&&(t[s]=e[s]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});const n=r(s(376));t.telemetry=n;const i=r(s(334));t.common=i},755:e=>{e.exports={i8:"0.4.0"}},334:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e){for(var s in e)t.hasOwnProperty(s)||(t[s]=e[s])}(s(329))},329:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0});const s=()=>{};t.NoOpLogger=class{constructor(){this.error=s,this.info=s,this.debug=s}}},504:function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(s(211)),i=s(334),o=r(s(761)),a=r(s(835)),c={Connection:"Keep-Alive","Content-Type":"application/json"};class l extends Error{constructor(e,t){super(e),Object.setPrototypeOf(this,new.target.prototype),this.innerError=t}}t.RequestResponseError=l;class u{constructor(e=new i.NoOpLogger){this.logger=e}addVersionInfo(e,t){this.product=e,this.productVersion=t}getUserAgentHeaderValue(e,t){if(!this.userAgentHeader){let s=e+"/"+t;this.product&&this.productVersion&&(s+=" "+this.product+"/"+this.productVersion),this.userAgentHeader=s}return this.userAgentHeader}static getPackageVersion(){if(!u.packageVersion)try{u.packageVersion=s(840).i8}catch(e){u.packageVersion=s(755).i8}return u.packageVersion}_sendData(e,t,s){o.default.gzip(t,((t,r)=>{if(t)return void s(t,null,null);const i=e.headers||{};Object.assign(i,c),i.Host=e.host,i["Content-Encoding"]="gzip",i["Content-Length"]=r.length,i["User-Agent"]=this.getUserAgentHeaderValue("NewRelic-nodejs-TelemetrySDK",u.getPackageVersion());const o={agent:new n.default.Agent({keepAlive:!0}),method:"POST",setHost:!1,host:e.host,port:e.port,path:a.default.format({pathname:e.pathname,query:e.query}),headers:i},d=n.default.request(o);d.on("error",(e=>{s(new l(e.message,e),null,null)})),d.on("response",(e=>{e.setEncoding("utf8");let t="";e.on("data",(e=>{t+=e})),e.on("error",(t=>{s(new l(t.message,t),e,null)})),e.on("end",(()=>{s(null,e,t)}))})),d.write(r),d.end()}))}}t.BaseClient=u},540:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.LIMIT=2e3;class s{constructor(e,s){if(this.common={attributes:e||{}},this.events=s||[],this.events.length>t.LIMIT){const e=this.events.splice(t.LIMIT);this.addEvent(...e)}}addEvent(...e){for(let s of e){this.events.push(s);const e=this.events.length;if(e>t.LIMIT){const t=this.getRandomInt(0,e-1),s=this.events[t];this.events[t]=this.events[e-1],this.events[e-1]=s,this.events.pop()}}return this}getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t+1-e))+e}getBatchSize(){return this.events.length}split(){if(0===this.events.length)return[];if(1===this.events.length){const e=[this.events[0]];return[s.createNew(this.common,e)]}const e=Math.floor(this.events.length/2),t=this.events.slice(0,e),r=this.events.slice(e);return[s.createNew(this.common,t),s.createNew(this.common,r)]}static createNew(e,t){return new s(e&&e.attributes,t)}flattenData(){return this.events.map((e=>Object.assign(Object.assign(Object.assign({},this.common.attributes),e.attributes),{eventType:e.eventType,timestamp:e.timestamp})))}}t.EventBatch=s},410:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(504);class n extends r.BaseClient{constructor(e,t){super(t),this._hasValidKey=this._isValidKey(e&&e.apiKey);const s={"Api-Key":e&&e.apiKey};this._sendDataOptions={headers:s,host:e&&e.host||"insights-collector.nr-data.net",pathname:"/v1/accounts/events",port:e&&e.port||443}}_isValidKey(e){return!!e}send(e,t){if(!this._hasValidKey){const e=new Error("A valid key must be provided for inserting events.");t(e,null,null)}const s={client:this,originalData:e},r=JSON.stringify(e.flattenData());this._sendData(this._sendDataOptions,r,((e,r,n)=>{t(e,r,n,s)}))}}t.EventClient=n},619:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Event=class{constructor(e,t,s){this.eventType=e,this.attributes=t||{},this.timestamp=s}}},800:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});var r=s(410);t.EventClient=r.EventClient;var n=s(540);t.EventBatch=n.EventBatch;var i=s(619);t.Event=i.Event},376:function(e,t,s){function r(e){for(var s in e)t.hasOwnProperty(s)||(t[s]=e[s])}var n=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var s in e)Object.hasOwnProperty.call(e,s)&&(t[s]=e[s]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});const i=n(s(800));t.events=i;const o=n(s(945));t.metrics=o;const a=n(s(225));t.spans=a;var c=s(504);t.RequestResponseError=c.RequestResponseError,r(s(3)),r(s(516))},580:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.LIMIT=2e3;class s{constructor(e,s,r,n){const i={};if(e&&(i.attributes=e),null!=r&&(i["interval.ms"]=r),null!=s&&(i.timestamp=s),Object.keys(i).length&&(this.common=i),this.metrics=n||[],this.metrics.length>t.LIMIT){const e=this.metrics.splice(t.LIMIT);for(const t of e.entries())this.addMetric(t[1])}}getBatchSize(){return this.metrics.length}split(){if(0===this.metrics.length)return[];if(1===this.metrics.length){const e=[this.metrics[0]];return[s.createNew(this.common,e)]}const e=Math.floor(this.metrics.length/2),t=this.metrics.slice(0,e),r=this.metrics.slice(e);return[s.createNew(this.common,t),s.createNew(this.common,r)]}static createNew(e,t){return new s(e&&e.attributes,e&&e.timestamp,e&&e["interval.ms"],t)}computeInterval(e){return this.common["interval.ms"]=e-this.common.timestamp,this}addMetric(e){this.metrics.push(e);const s=this.metrics.length;if(s>t.LIMIT){const e=this.getRandomInt(0,s-1),t=this.metrics[e];this.metrics[e]=this.metrics[s-1],this.metrics[s-1]=t,this.metrics.pop()}return this}getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t+1-e))+e}}t.MetricBatch=s},537:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(504);class n extends r.BaseClient{constructor(e,t){super(t),this._hasValidKey=this._isValidKey(e&&e.apiKey);const s={"Api-Key":e&&e.apiKey};this._sendDataOptions={host:e&&e.host||"metric-api.newrelic.com",port:443,pathname:"/metric/v1",headers:s}}_isValidKey(e){return!!e}send(e,t){if(!this._hasValidKey){const e=new Error("A valid key must be provided for inserting metrics.");t(e,null,null)}const s={client:this,originalData:e},r=`[${JSON.stringify(e)}]`;this._sendData(this._sendDataOptions,r,((e,r,n)=>{t(e,r,n,s)}))}}t.MetricClient=n},735:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(787);class n extends r.MetricBase{constructor(e,t=0,s,n,i){super(e,r.MetricType.Count,t,s,n,i)}record(e=1){return this.value+=e,this}}t.CountMetric=n},967:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(787);class n extends r.MetricBase{constructor(e,t,s,n=Date.now()){super(e,r.MetricType.Gauge,t,s,n)}record(e){return this.value=e,this.timestamp=Date.now(),this}}t.GaugeMetric=n},945:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});var r=s(537);t.MetricClient=r.MetricClient;var n=s(580);t.MetricBatch=n.MetricBatch;var i=s(152);t.SummaryMetric=i.SummaryMetric;var o=s(735);t.CountMetric=o.CountMetric;var a=s(967);t.GaugeMetric=a.GaugeMetric;var c=s(787);t.MetricType=c.MetricType},787:(e,t)=>{var s;Object.defineProperty(t,"__esModule",{value:!0}),function(e){e.Summary="summary",e.Gauge="gauge",e.Count="count"}(s=t.MetricType||(t.MetricType={})),t.MetricBase=class{constructor(e,t=s.Gauge,r,n,i,o){this.name=e,this.type=t,this.value=r,n&&Object.keys(n).length>0&&(this.attributes=n),this.timestamp=i,this["interval.ms"]=o}}},152:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(787);class n extends r.MetricBase{constructor(e,t={count:0,sum:0,min:1/0,max:-1/0},s,n,i){super(e,r.MetricType.Summary,t,s,n,i)}record(e){return++this.value.count,this.value.sum+=e,this.value.min=Math.min(this.value.min,e),this.value.max=Math.max(this.value.max,e),this}}t.SummaryMetric=n},516:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(3);function n(e,t,s,n,a,c){(a=a||{}).retryFactor=a.retryFactor||1,a.maxRetries=a.maxRetries||10,a.backoffMaxInterval=a.backoffMaxInterval||16,t&&n.client.logger.debug("Response status: ",t.statusCode);const l=r.parseResponse(e,t);l.error&&n.client.logger.debug("Encountered error: ",l.error);const u=l.recommendedAction;switch(u){case r.RecommendedAction.Success:return function(e,t){const{client:s,originalData:n}=e,i=n.getBatchSize();s.logger.debug(`Successfully sent ${i} data points.`),t&&setImmediate(t,null,r.RecommendedAction.Success)}(n,c);case r.RecommendedAction.Discard:return i(n,l.error,c);case r.RecommendedAction.Retry:return function(e,t,s){const{client:r,originalData:n}=e,a=e.retryCount||1;if(a>t.maxRetries)return r.logger.info("Maximum retries reached."),i(e,null,s);const c=1e3*t.retryFactor;r.logger.info(`Send failed. Retrying in ${c}ms.`),setTimeout((()=>{const e=o(a,t,s);r.send(n,e)}),c)}(n,a,c);case r.RecommendedAction.SplitRetry:return function(e,t,s){const{client:n,originalData:a}=e,c=e.retryCount||1;if(c>t.maxRetries)return n.logger.info("Maximum retries reached."),i(e,null,s);const l=1e3*t.retryFactor;n.logger.info(`Batch size too large, splitting and retrying in ${l}ms.`);const u=a.split(),d=u.length;setTimeout((()=>{for(let e=0;e<d;e++){const e=u[0],s=o(c,t,f);n.send(e,s)}}),l);let h=0,p=null,m=!1;function f(e,t){if(p=e||p,t===r.RecommendedAction.Discard&&(m=!0),h++,h>=d){const e=m?r.RecommendedAction.Discard:r.RecommendedAction.Success;s(p,e)}}}(n,a,c);case r.RecommendedAction.RetryAfter:return function(e,t,s,r){const{client:n,originalData:a}=t,c=t.retryCount||1;if(c>s.maxRetries)return n.logger.info("Maximum retries reached."),i(t,null,r);n.logger.error(`Send failed. Retrying in ${e}ms.`),setTimeout((()=>{const e=o(c,s,r);n.send(a,e)}),e)}(l.retryAfterMs,n,a,c);case r.RecommendedAction.Backoff:return function(e,t,s,r){const{client:n,originalData:a}=e,c=e.retryCount||1;if(c>s.maxRetries)return n.logger.info("Maximum retries reached."),i(e,t,r);const l=s.retryFactor*Math.pow(2,c-1),u=1e3*Math.min(s.backoffMaxInterval,l);n.logger.info(`Send failed. Retrying with backoff in ${u} milliseconds.`),setTimeout((()=>{const e=o(c,s,r);n.send(a,e)}),u)}(n,l.error,a,c);default:{const e=new Error(`Unexpected action: ${r.RecommendedAction[u]}`);return n.client.logger.error(e.message),i(n,e,c)}}}function i(e,t,s){const{client:n,originalData:i}=e,o=i.getBatchSize();n.logger.error(`Send failed. Discarding ${o} data points.`),s&&setImmediate(s,t,r.RecommendedAction.Discard)}function o(e,t,s){return function(r,i,o,a){return a.retryCount=e+1,n(r,i,0,a,t,s)}}t.createRecommendedStrategyHandler=function(e,t){return function(s,r,i,o){return n(s,r,0,o,e,t)}},t.recommendedStrategyHandler=n},3:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(504);var n;!function(e){e[e.Success=0]="Success",e[e.Discard=1]="Discard",e[e.Retry=2]="Retry",e[e.SplitRetry=3]="SplitRetry",e[e.RetryAfter=4]="RetryAfter",e[e.Backoff=5]="Backoff"}(n=t.RecommendedAction||(t.RecommendedAction={}));const i=new Set([400,401,403,404,405,409,410,411]);t.parseResponse=function(e,t){return e?function(e){const t={recommendedAction:n.Discard,error:e};return e instanceof r.RequestResponseError&&(t.recommendedAction=n.Backoff,t.error=e.innerError),t}(e):function(e,t){const s={recommendedAction:n.Backoff};if(e<300)s.recommendedAction=n.Success;else if(i.has(e))s.recommendedAction=n.Discard;else if(408===e)s.recommendedAction=n.Retry;else if(413===e)s.recommendedAction=n.SplitRetry;else if(429===e){s.recommendedAction=n.RetryAfter;const e=1e3*parseInt(t["retry-after"].toString(),10);s.retryAfterMs=e}return s}(t.statusCode,t.headers)}},416:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.LIMIT=2e3;class s{constructor(e,s){if(e){const t={};t.attributes=e,this.common=t}if(this.spans=s||[],this.spans.length>t.LIMIT){const e=this.spans.splice(t.LIMIT);this.addSpan(...e)}}addSpan(...e){for(let s of e){this.spans.push(s);const e=this.spans.length;if(e>t.LIMIT){const t=this.getRandomInt(0,e-1),s=this.spans[t];this.spans[t]=this.spans[e-1],this.spans[e-1]=s,this.spans.pop()}}return this}getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t+1-e))+e}getBatchSize(){return this.spans.length}split(){if(0===this.spans.length)return[];if(1===this.spans.length){const e=[this.spans[0]];return[s.createNew(this.common,e)]}const e=Math.floor(this.spans.length/2),t=this.spans.slice(0,e),r=this.spans.slice(e);return[s.createNew(this.common,t),s.createNew(this.common,r)]}static createNew(e,t){return new s(e&&e.attributes,t)}}t.SpanBatch=s},269:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(504);class n extends r.BaseClient{constructor(e,t){super(t),this._hasValidKey=this._isValidKey(e&&e.apiKey);const s={"Api-Key":e&&e.apiKey,"Data-Format":"newrelic","Data-Format-Version":1};this._sendDataOptions={headers:s,host:e&&e.host||"trace-api.newrelic.com",pathname:"/trace/v1",port:e&&e.port||443}}_isValidKey(e){return!!e}send(e,t){if(!this._hasValidKey){const e=new Error("A valid key must be provided for inserting spans.");t(e,null,null)}const s={client:this,originalData:e},r=`[${JSON.stringify(e)}]`;this._sendData(this._sendDataOptions,r,((e,r,n)=>{t(e,r,n,s)}))}}t.SpanClient=n},225:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});var r=s(269);t.SpanClient=r.SpanClient;var n=s(416);t.SpanBatch=n.SpanBatch;var i=s(377);t.Span=i.Span},377:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Span=class{constructor(e,t,s,r,n,i,o,a){this.id=e,this["trace.id"]=t,this.timestamp=s,(r||n||i||null!=o||a)&&(this.attributes=a||{},r&&(this.attributes.name=r),n&&(this.attributes["parent.id"]=n),i&&(this.attributes["service.name"]=i),null!=o&&(this.attributes["duration.ms"]=o))}}},840:e=>{e.exports={i8:"0.4.0"}},763:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const r=s(529),n=s(635);t.default=class{constructor(e){this.spanProcessor=new n.SpanProcessor(e)}determineMessageType(e){return r.MessageType.Span}processMessages(e){JSON.parse(e).records.forEach((e=>{switch(this.determineMessageType(e)){case r.MessageType.Span:return this.spanProcessor.processMessage(e)}}),this)}sendBatches(e){const t=[];t.push(this.spanProcessor.sendBatch()),Promise.allSettled(t).then((t=>{t.filter((e=>"rejected"===e.status)).map((t=>e.log(`Error occurred while sending telemetry to New Relic: ${t.reason}`)))}))}}},529:(e,t)=>{var s;Object.defineProperty(t,"__esModule",{value:!0}),t.MessageType=void 0,(s=t.MessageType||(t.MessageType={}))[s.Event=0]="Event",s[s.Log=1]="Log",s[s.Metric=2]="Metric",s[s.Span=3]="Span"},635:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.SpanProcessor=void 0;var r=s(202);Object.defineProperty(t,"SpanProcessor",{enumerable:!0,get:function(){return r.default}})},202:function(e,t,s){var r=this&&this.__rest||function(e,t){var s={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(s[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(r=Object.getOwnPropertySymbols(e);n<r.length;n++)t.indexOf(r[n])<0&&Object.prototype.propertyIsEnumerable.call(e,r[n])&&(s[r[n]]=e[r[n]])}return s};Object.defineProperty(t,"__esModule",{value:!0});const n=s(922),i=["sql","mariadb","postgresql","cosmos","table","storage"],o={DependencyType:"dependency.type",Target:"xxx.target",Data:{db:"db.statement",http:"http.url"},HttpMethod:"http.method",HttpPath:"http.path",Source:"http.source",ResultCode:"xxx.responseCode",Url:"http.url",Type:"log.type"};t.default=class{constructor(e){this.client=new n.telemetry.spans.SpanClient({apiKey:e}),this.startNewBatch()}startNewBatch(){this.batch=new n.telemetry.spans.SpanBatch({"cloudProvider.source":"azure"})}processMessage(e){delete e.IKey;const{Id:t,ParentId:s,OperationId:a,time:c,Name:l,DurationMs:u,OperationName:d,Properties:h={}}=e,p=r(e,["Id","ParentId","OperationId","time","Name","DurationMs","OperationName","Properties"]),m=new Date(c).getTime(),f=Object.assign({},(e=>{const t={},{DependencyType:s=""}=e,r=i.includes(s.toLowerCase())?"db":"http";return Object.entries(e).forEach((([e,s])=>{if(o[e]){if("Data"===e)return void(t[o[e][r]]=s);const n=o[e].replace("xxx",r);t[n]=s}else t[e]=s})),t})(Object.assign(Object.assign({},p),h))),g=new n.telemetry.spans.Span(t,a,m,l,s===a?null:s,d,u,f);this.batch.addSpan(g)}sendBatch(){return new Promise(((e,t)=>{this.client.send(this.batch,(e=>{e&&t(e)})),this.startNewBatch(),e()}))}}},875:function(e,t,s){var r=this&&this.__awaiter||function(e,t,s,r){return new(s||(s=Promise))((function(n,i){function o(e){try{c(r.next(e))}catch(e){i(e)}}function a(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(o,a)}c((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(763),i=process.env.NEW_RELIC_INSERT_KEY,o=new n.default(i);t.default=function(e,t){return r(this,void 0,void 0,(function*(){e.log(`Eventhub trigger function called for message array ${t}`),t.forEach(o.processMessages),o.sendBatches(e)}))}},211:e=>{e.exports=require("https")},835:e=>{e.exports=require("url")},761:e=>{e.exports=require("zlib")}},t={};!function s(r){var n=t[r];if(void 0!==n)return n.exports;var i=t[r]={exports:{}};return e[r].call(i.exports,i,i.exports,s),i.exports}(875)})();