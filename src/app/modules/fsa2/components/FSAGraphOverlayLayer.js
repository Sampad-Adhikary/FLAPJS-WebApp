import React from 'react';

import ViewportEditLayer from 'graph2/components/layer/ViewportEditLayer.js';
import ViewportNavigationLayer from 'graph2/components/layer/ViewportNavigationLayer.js';
import LabelEditorView from 'graph2/components/views/LabelEditorView.js';

import FSALabelEditorRenderer from '../graph/widgets/FSALabelEditorRenderer.js';

class FSAGraphOverlayLayer extends React.Component
{
    constructor(props) { super(props); }

    /** @override */
    render()
    {
        const currentModule = this.props.module;
        const graphView = this.props.graphView;
        const graphController = this.props.graphController;
        const labelFormatter = graphController.getLabelFormatter();
        const inputController = graphView.getInputController();

        return (
            <React.Fragment>
                <ViewportEditLayer
                    graphController={graphController}
                    inputController={inputController}
                    viewport={graphView.getViewportComponent()}/>
                <ViewportNavigationLayer
                    style={{ right: 0 }}
                    viewportAdapter={graphView.getViewportAdapter()} />
                <LabelEditorView ref={ref => graphController.setLabelEditor(ref)}
                    labelFormatter={labelFormatter}
                    viewport={graphView.getViewportComponent()}
                    saveOnExit={true}>
                    <FSALabelEditorRenderer
                        graphController={graphController}
                        currentModule={currentModule} />
                </LabelEditorView>
            </React.Fragment>
        );
    }
}

export default FSAGraphOverlayLayer;