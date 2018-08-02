import NodalGraph from './NodalGraph.js';

class GraphUploader
{
  static uploadFileToGraph(fileBlob, graph, callback=null, errorCallback=null)
  {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      try
      {
        const dataJSON = JSON.parse(data);
        const dst = NodalGraph.parseJSON(dataJSON);
        graph.copyGraph(dst);

        if (callback) callback();
      }
      catch(e)
      {
        reader.abort();

        if (errorCallback) errorCallback();
      }
    };
    reader.onerror = (event) => {
      if (errorCallback) errorCallback(event.target.error.code);
    };
    reader.readAsText(fileBlob);
  }

  static uploadJFLAPToGraph(fileBlob, graph, callback=null, errorCallback=null)
  {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      try
      {
        let parser = new DOMParser();
        const dataXML = parser.parseFromString(data, "text/xml");
        const dst = NodalGraph.parseXML(dataXML);

        graph.copyGraph(dst);

        if (callback) callback();
      }
      catch(e)
      {
        console.log(e);
        reader.abort();

        if (errorCallback) errorCallback();
      }
    };
    reader.onerror = (event) => {
      if (errorCallback) errorCallback(event.target.error.code);
    };
    reader.readAsText(fileBlob);
  }
}

export default GraphUploader;
