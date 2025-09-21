// src/components/debug/StackingDebug.js - DEBUG COMPONENT
import React, { useEffect, useState } from 'react';

const StackingDebug = ({ enabled = false }) => {
  const [stackingInfo, setStackingInfo] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    const analyzeStackingContexts = () => {
      const elements = [
        { selector: 'body', name: 'Body' },
        { selector: '.container', name: 'Container' },
        { selector: '.app-header', name: 'Header' },
        { selector: '.content', name: 'Content' },
        { selector: '.dashboard-grid-nav', name: 'Navigation' },
        { selector: '.modal-overlay', name: 'Modal Overlay' },
        { selector: '.modal-content-enhanced', name: 'Modal Content' },
        { selector: '.matches-grid', name: 'Matches Grid' },
        { selector: '.match-card-enhanced', name: 'Match Card' }
      ];

      const results = elements.map(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (!element) return { name, exists: false };

        const styles = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        const stackingProperties = {
          position: styles.position,
          zIndex: styles.zIndex,
          transform: styles.transform,
          opacity: styles.opacity,
          isolation: styles.isolation,
          filter: styles.filter,
          display: styles.display
        };

        // Check if creates stacking context
        const createsContext = (
          (styles.position !== 'static' && styles.zIndex !== 'auto') ||
          styles.transform !== 'none' ||
          parseFloat(styles.opacity) < 1 ||
          styles.isolation === 'isolate' ||
          styles.filter !== 'none' ||
          styles.mixBlendMode !== 'normal' ||
          styles.clipPath !== 'none'
        );

        return {
          name,
          exists: true,
          selector,
          stackingProperties,
          createsContext,
          rect: {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        };
      });

      setStackingInfo(results);
    };

    // Initial analysis
    analyzeStackingContexts();

    // Re-analyze when modal opens/closes
    const observer = new MutationObserver(() => {
      setTimeout(analyzeStackingContexts, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid red',
      padding: '10px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 999999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>🔍 Stacking Debug</h3>
      
      {stackingInfo.map((info, index) => (
        <div key={index} style={{ 
          marginBottom: '15px', 
          padding: '8px', 
          border: info.createsContext ? '2px solid orange' : '1px solid gray',
          backgroundColor: info.createsContext ? '#fff3cd' : '#f8f9fa'
        }}>
          <strong style={{ 
            color: info.createsContext ? 'orange' : 'black' 
          }}>
            {info.name} {info.createsContext ? '⚠️ SC' : '✅'}
          </strong>
          
          {!info.exists ? (
            <div style={{ color: 'red' }}>❌ Not found</div>
          ) : (
            <>
              <div><strong>Position:</strong> {info.stackingProperties.position}</div>
              <div><strong>Z-Index:</strong> {info.stackingProperties.zIndex}</div>
              <div><strong>Transform:</strong> {info.stackingProperties.transform === 'none' ? 'none' : '⚠️ has transform'}</div>
              <div><strong>Opacity:</strong> {info.stackingProperties.opacity}</div>
              <div><strong>Isolation:</strong> {info.stackingProperties.isolation}</div>
              <div><strong>Rect:</strong> {info.rect.width}×{info.rect.height} @ ({info.rect.left}, {info.rect.top})</div>
              {info.createsContext && (
                <div style={{ color: 'orange', fontWeight: 'bold' }}>
                  🚨 Creates Stacking Context
                </div>
              )}
            </>
          )}
        </div>
      ))}
      
      <div style={{ marginTop: '15px', padding: '8px', backgroundColor: '#e7f3ff', border: '1px solid #0066cc' }}>
        <strong>Legend:</strong><br/>
        ⚠️ SC = Creates Stacking Context<br/>
        ✅ = Normal element<br/>
        ❌ = Element not found
      </div>
    </div>
  );
};

export default StackingDebug;