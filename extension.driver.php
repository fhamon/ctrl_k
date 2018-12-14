<?php

    class extension_ctrl_k extends Extension
    {

        public function getSubscribedDelegates()
        {
            return array(
                array(
                    'page' => '/backend/',
                    'delegate' => 'InitaliseAdminPageHead',
                    'callback' => 'addScriptToHead'
                )
            );
        }

        public function addScriptToHead($context)
        {
            Administration::instance()->Page->addScriptToHead('https://cdn.jsdelivr.net/autocomplete.js/0/autocomplete.jquery.min.js');
            Administration::instance()->Page->addScriptToHead(URL.'/extensions/ctrl_k/assets/ctrl_k.js');
            Administration::instance()->Page->addStylesheetToHead(URL.'/extensions/ctrl_k/assets/ctrl_k.css');
        }
    }
