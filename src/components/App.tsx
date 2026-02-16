@@ .. @@
         {currentPage === 'dedicated' && currentCategory && (
           <DedicatedServerPage 
             category={currentCategory}
             onBack={handleBackToHome}
+            onServerClick={handleNavigateToServer}
           />
         )}