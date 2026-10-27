package com.reproducerapp

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.views.view.ReactViewGroup

class ClippingViewManager : ViewGroupManager<ReactViewGroup>() {
  override fun getName(): String = "ReproducerClippingView"

  override fun createViewInstance(context: ThemedReactContext): ReactViewGroup =
    ReactViewGroup(context).apply { clipChildren = true }
}
