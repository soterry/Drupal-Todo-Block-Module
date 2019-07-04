<?php

namespace Drupal\todo\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'TodoBlock' Block.
 *
 * @Block(
 *   id = "todo_block",
 *   admin_label = @Translation("Todo List Block"),
 *   category = @Translation("Others"),
 * )
 */
class TodoBlock extends BlockBase {

    /**
     * {@inheritdoc}
     */
    public function build() {
        return [
            '#theme' => 'todo-block',
            '#tasks' => \Drupal::database()->select('todo', 't')->fields('t')->execute(),
            '#attached' => [
                'library' => ['todo/todo'],
            ],
        ];
    }

    public function getCacheMaxAge() {
//        \Drupal::service('page_cache_kill_switch')->trigger();
        return 0;
    }

}
