<?php

namespace Drupal\Tests\loremipsum\Functional;

use Drupal\Tests\block\Functional\BlockTestBase;

/**
 * Tests for the Todo module Todo Block.
 *
 * @group loremipsum
 */
class TodoBlockTestCase extends BlockTestBase {

    /**
     * Modules to install.
     *
     * @var array
     */
    protected static $modules = ['block', 'filter', 'test_page_test', 'help', 'block_test', 'todo'];

    /**
     * Perform initial setup tasks that run before every test method.
     */
    public function setUp() {
        parent::setUp();
    }
    
    public function testTodoBlockList() {
        
    }

    public function testTodoBlockInsert() {
        
    }

    public function testTodoBlockFinish() {
        
    }

    public function testTodoBlockDelete() {
        
    }

}
