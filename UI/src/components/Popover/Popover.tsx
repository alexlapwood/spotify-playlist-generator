import cn from "classnames";
import React from "react";

import getFocusableElement from "./private/helpers/getFocusableElement";
import { Location } from "./private/helpers/positioning";
import PortalFocusHelper from "./private/PortalFocusHelper";
import Positioning from "./private/Positioning";

import "./Popover.css";

interface Props {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  onClickOutside?: () => void;
  preferredPosition?: Location;
  triggerRef: React.RefObject<
    | HTMLElement
    | {
        rootNode: HTMLElement | React.RefObject<HTMLElement>;
      }
  >;
}

export default class Popover extends React.Component<Props> {
  private wrapperRef = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    this.addEventListeners();
  }

  public componentDidUpdate() {
    this.removeEventListeners();
    this.addEventListeners();
  }

  public componentWillUnmount() {
    this.removeEventListeners();

    if (
      this.wrapperRef.current &&
      this.wrapperRef.current.contains(document.activeElement)
    ) {
      this.focusOnTheTrigger();
    }
  }

  public render() {
    const {
      className,
      children,
      id,
      onClickOutside,
      preferredPosition,
    } = this.props;

    const triggerRef = this.getTriggerRef();

    const arrowSize = 8;
    const borderShadowSize = 1;

    return (
      <React.Fragment>
        <Positioning
          pageBuffer={arrowSize}
          preferredLocation={preferredPosition}
          triggerBuffer={arrowSize + borderShadowSize}
          triggerRef={triggerRef}
        >
          {(location?: Location, isFullWidth?: boolean) => (
            <React.Fragment>
              <div
                className={cn(
                  `Popover`,
                  isFullWidth && "Popover--fullwidth",
                  className
                )}
                id={id}
                ref={this.wrapperRef}
                role="dialog"
              >
                <PortalFocusHelper
                  focusPortalRef={triggerRef}
                  onReturnFocus={onClickOutside}
                >
                  <div className={cn("Popover-body")}>{children}</div>
                </PortalFocusHelper>
              </div>
              <Positioning
                pageBuffer={arrowSize}
                preferredLocation={location}
                triggerRef={triggerRef}
              >
                {() => <div className={`Popover-arrow--${location}`} />}
              </Positioning>
            </React.Fragment>
          )}
        </Positioning>
      </React.Fragment>
    );
  }

  private addEventListeners = () => {
    document.addEventListener("click", this.handleClickOutside);
  };

  private removeEventListeners = () => {
    document.removeEventListener("click", this.handleClickOutside);
  };

  private handleClickOutside = (
    event: MouseEvent | FocusEvent | React.FocusEvent
  ) => {
    const { onClickOutside } = this.props;

    if (
      onClickOutside &&
      event.target &&
      this.wrapperRef.current &&
      !this.wrapperRef.current.contains(event.target as Node)
    ) {
      onClickOutside && onClickOutside();
    }
  };

  private focusOnTheTrigger = () => {
    const triggerRef = this.getTriggerRef();

    if (!triggerRef.current) {
      return;
    }

    const focusableElement = getFocusableElement(triggerRef.current);

    if (!focusableElement) {
      return;
    }

    focusableElement.focus();
  };

  getTriggerRef = () => {
    return {
      _triggerRef: this.props.triggerRef,
      get current() {
        if (!this._triggerRef.current) {
          return null;
        }

        if (this._triggerRef.current instanceof HTMLElement) {
          return this._triggerRef.current;
        }
        if (!this._triggerRef.current.rootNode) {
          return null;
        }

        if (this._triggerRef.current.rootNode instanceof HTMLElement) {
          return this._triggerRef.current.rootNode;
        }

        if (this._triggerRef.current.rootNode.current instanceof HTMLElement) {
          return this._triggerRef.current.rootNode.current;
        }

        return null;
      },
    };
  };
}
